import type { AuthProviderPropsType } from 'containers/auth/AuthProvider/context';
import redirectToLoginPage from 'containers/auth/AuthProvider/redirectToLoginPage';

import { getLocalItem, setLocalItem } from 'utils/service/localStorage';

import { type ServerAuthToken, apiUserRefreshToken } from './auth';

const promise: {
  refresh: Promise<ServerAuthToken> | null;
} = { refresh: null };

// Set authentication token header to apisauce instance
export const setTokenHeader = async (optional = false, apiPath?: string) => {
  // Already have token, skipping
  // TODO: get from window, better speed
  const auth: AuthProviderPropsType | undefined = (await getLocalItem(
    'auth',
  )) as any;

  if (!auth) {
    await redirectToLoginPage(optional, apiPath);
    return false;
  }

  const { token, refreshToken, serverTime, expiresIn, refreshTokenExpiresIn } =
    auth;

  // No existing token
  if (
    !token ||
    !serverTime ||
    !refreshToken ||
    !expiresIn ||
    !refreshTokenExpiresIn
  ) {
    await redirectToLoginPage(optional, apiPath);
    return false;
  }

  // Check if token has expired
  const timeNow = new Date().getTime();

  // First check refresh token
  if (refreshTokenExpiresIn < timeNow - serverTime) {
    // Expired refresh token
    // Redirect user to login page
    await redirectToLoginPage(
      optional,
      apiPath,
      'Your session has expired. Please login again.',
    );
    return false;
  }

  // Check if access token expired
  if (expiresIn < timeNow - serverTime) {
    // Refresh token
    let data: Omit<AuthProviderPropsType, 'isLoggedIn'> | undefined;
    try {
      if (!promise.refresh) {
        promise.refresh = apiUserRefreshToken(refreshToken);
      }
      data = await promise.refresh;
    } catch (e) {
      console.error(e);
      // Failed to get token
      await setLocalItem('auth', {});
      await redirectToLoginPage(
        optional,
        apiPath,
        'Your session has expired. Please login again.',
      );
      return false;
    }
    promise.refresh = null;

    // Check if new token is sufficient
    if (
      !data?.token ||
      !data?.refreshToken ||
      !data?.expiresIn ||
      !data?.refreshTokenExpiresIn ||
      !data?.serverTime
    ) {
      await redirectToLoginPage(
        optional,
        apiPath,
        'Your session is outdated. Please login again.',
      );
      return false;
    }

    // Pass new token to store
    await setLocalItem('auth', {
      ...auth,
      isLoggedIn: true,
      token: data.token,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      refreshTokenExpiresIn: data.refreshTokenExpiresIn,
      serverTime: data.serverTime,
      role: data.role,
      lang: data.lang,
    });

    return data.token;
  }

  return token;
};
