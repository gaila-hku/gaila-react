import { type AxiosResponseHeaders } from 'axios';
import { getCurrentLang } from 'locales/helper';
import { isArray } from 'lodash-es';

import redirectToLoginPage from 'containers/auth/AuthProvider/redirectToLoginPage';

import Config from 'config';
import { getLocalItem } from 'utils/service/localStorage';

import { getTypedRequestor } from './_requestor';
import { setTokenHeader } from './_token';

const appendFormDataValue = (formData: FormData, key: string, value: any) => {
  if (value instanceof File && (value as any).useBinaryKey) {
    formData.append(`binary__${key}`, value);
    return;
  }
  formData.append(key, value);
};

// Only support maximum 2d
const objectToFormData = data => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      data[key].forEach((value, index) => {
        appendFormDataValue(formData, `${key}[${index}]`, value);
      });
    } else {
      appendFormDataValue(formData, key, data[key]);
    }
  });
  return formData;
};

export interface callAPIHandlerOption {
  cache?: boolean | number;
  redirect?: boolean;
  raw?: boolean;
  flatten?: boolean;
  postProcessData?: (data: any, headers?: AxiosResponseHeaders) => any;
  skipMocker?: boolean;
  language?: string;
  responseType?: 'blob';
}

interface callAPIHandlerExtraOption {
  headers: Record<string, string>;
}

const defaultConfig = {
  cache: false,
  redirect: true,
  raw: false,
};

const noCacheApiEndpoints = import.meta.env.VITE_NO_CACHE_API?.split(',');

function flattenParams(
  object: Record<string, any>,
  parentKey?: string,
): Record<string, unknown> {
  let flatten = {} as { [key: string]: unknown };
  Object.entries(object).forEach(([key, value]) => {
    const newKeyName = parentKey ? `${parentKey}[${key}]` : key;
    if (
      typeof value === 'object' &&
      !(value instanceof File) &&
      value !== null
    ) {
      flatten = { ...flatten, ...flattenParams(value, newKeyName) };
    } else {
      flatten[newKeyName] = value;
    }
  });
  return flatten;
}

export type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

// Call API with token
export async function callAPIHandler<T>(
  type: Method,
  apiPath: string,
  inputData: Record<string, any>,
  withToken: boolean,
  config?: callAPIHandlerOption,
  extraOptions?: callAPIHandlerExtraOption,
): Promise<T & ResponseType> {
  try {
    // Merge config with default config
    const apiConfig = { ...defaultConfig, ...config };

    // Add Extra Data to request body
    let data: Record<string, any> = {
      ...inputData,
      lang: apiConfig.language || getCurrentLang(),
      p6m: import.meta.env.VITE_P6M || 'sys',
    };

    const useCache =
      !!apiConfig.cache && !noCacheApiEndpoints?.includes(apiPath);

    // Flag api to apply cache
    if (useCache) {
      data = { ...data, _cache: '1' };
    }

    // Flatten
    if (apiConfig.flatten) {
      data = flattenParams(data);
    }

    // Add role
    const role = (await getLocalItem('impersonate-group')) as { value: string };
    if (role?.value) {
      data = {
        ...data,
        impersonated_group_id: role.value,
      };
    }

    // Use form data if data have files
    const withFiles = Object.values(data).some(v => {
      if (isArray(v)) return v.some(s => s instanceof File);
      return v instanceof File;
    });
    const requestData = withFiles
      ? objectToFormData(flattenParams(data))
      : data;

    const extraHeaders: any = {};
    if (withFiles) {
      extraHeaders['Content-Type'] = 'multipart/form-data';
    }

    // Get Auth Token into header
    const optionalAuth = apiConfig.redirect === false;
    const token = withToken
      ? await setTokenHeader(optionalAuth, apiPath)
      : undefined;

    if (withToken && !optionalAuth && !token) {
      throw new Error('Unauthenticated');
    }

    // Send request
    const res = await getTypedRequestor(type)(apiPath, requestData, {
      ...extraOptions,
      ...(config?.responseType === 'blob' ? { responseType: 'blob' } : {}),
      cache: useCache // Flag api to apply cache
        ? {
            ttl:
              typeof apiConfig.cache === 'number'
                ? apiConfig.cache
                : Config.maxAge,
          }
        : false,
      headers: {
        ...extraHeaders,
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(extraOptions?.headers ? extraOptions.headers : {}),
      },
    });

    if (!res) {
      throw new Error('There is some issue with the network. Please retry.');
    }

    if (config?.raw) {
      return res as any;
    }

    // Unauthorized
    if (res.status === 401) {
      console.log('redirecting', apiPath, apiConfig);
      redirectToLoginPage(
        apiConfig.redirect === false,
        apiPath,
        res.data?.error_message || 'Unauthorized',
      );
      throw new Error(res.data?.error_message || 'Unauthorized');
    }

    // Not ok
    if (res.status < 200 || res.status >= 300) {
      if (res.status === 429) {
        throw new Error('Too many requests. Please retry in a moment.');
      }

      if (res.data?.error_message) {
        // Error response
        throw res.data;
      }

      // Blob error
      if (
        res.data?.type === 'application/json' &&
        res.data?.constructor?.name === 'Blob'
      ) {
        const blobText = await res.data.text();
        const blobRes = JSON.parse(blobText);
        if (blobRes.error) {
          throw blobRes;
        }
      }

      console.error(res);
      throw new Error('Something went wrong. Please try again.');
    }

    // Handle response
    if (!res.data) {
      throw new Error('There is some issue with the server. Please retry.');
    }

    if (config?.postProcessData) {
      return config.postProcessData(
        res.data,
        res.headers as AxiosResponseHeaders,
      );
    }

    return res.data;
  } catch (error: any) {
    const message = error.error_message || error.errorMessage || error.message;
    const code = error.error_code || error.errorCode || 'internal';

    // TODO: v5, remove errorMessage & errorCode, migrate to only multiple error_messages & error_codes

    throw {
      ...error,
      error: true,
      errorMessage: message, // Frontend main error message
      errorCode: code, // Frontend main error code
      trace: error.stack,
    };
  }
}
