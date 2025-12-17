import { callAPIHandler } from 'api/_base';
import {
  type Class,
  type ClassListingResponse,
  type ClassManagementDetail,
} from 'types/class';
import type { ListingResponse } from 'types/response';

export const apiGetClasses = async ({
  queryKey,
}: {
  queryKey: [string, { page: number; limit: number; filter: string }];
}) => {
  const [, { page, limit, filter }] = queryKey;
  const res = await callAPIHandler<ClassListingResponse>(
    'get',
    '/class/listing',
    { page, limit, filter },
    true,
  );
  return res;
};
apiGetClasses.queryKey = '/class/listing';

export const apiGetClassDetail = async ({
  queryKey,
}: {
  queryKey: [string, { id: number }];
}) => {
  const [, { id }] = queryKey;
  const res = await callAPIHandler<Class>('get', '/class/view', { id }, true);
  return res;
};
apiGetClassDetail.queryKey = '/class/view';

export const apiGetAllClasses = async ({
  queryKey,
}: {
  queryKey: [string, { page: number; limit: number; filter: string }];
}) => {
  const [, { page, limit, filter }] = queryKey;
  const res = await callAPIHandler<ListingResponse<ClassManagementDetail>>(
    'get',
    '/class/listing-all',
    { page, limit, filter },
    true,
  );
  return res;
};
apiGetAllClasses.queryKey = '/class/listing-all';

export const apiUpdateClass = async (req: {
  id: number;
  name?: string;
  class_key: string;
  description?: string;
  students?: number[];
  teachers?: number[];
}) => {
  const res = await callAPIHandler<ListingResponse<ClassManagementDetail>>(
    'post',
    '/class/update',
    req,
    true,
  );
  return res;
};

export const apiCreateClass = async (req: {
  name: string;
  class_key: string;
  description?: string;
}) => {
  const res = await callAPIHandler<ListingResponse<Class>>(
    'post',
    '/class/create',
    req,
    true,
  );
  return res;
};
