import { callAPIHandler } from 'api/_base';
import { type ClassOptionResponse } from 'types/class';
import type { ListingResponse } from 'types/response';
import type { StudentOptionResponse, User, UserListingItem } from 'types/user';

export const apiGetClassOptions = async ({
  queryKey: _,
}: {
  queryKey: [string];
}) => {
  const res = await callAPIHandler<ClassOptionResponse>(
    'get',
    '/user/class-options',
    {},
    true,
  );
  return res;
};
apiGetClassOptions.queryKey = '/user/class-options';

export const apiGetStudentOptions = async ({
  queryKey,
}: {
  queryKey: [string, { classId: number }];
}) => {
  const [, { classId }] = queryKey;
  const res = await callAPIHandler<StudentOptionResponse>(
    'get',
    '/user/student-options',
    { classId },
    true,
  );
  return res;
};
apiGetStudentOptions.queryKey = '/user/student-options';

export const apiGetUserListing = async ({
  queryKey,
}: {
  queryKey: [
    string,
    {
      page: number;
      limit: number;
      filter?: string;
      sort?: string;
      sort_order?: 'asc' | 'desc';
    },
  ];
}) => {
  const [, params] = queryKey;
  const res = await callAPIHandler<ListingResponse<UserListingItem>>(
    'get',
    '/user/listing',
    params,
    true,
  );
  return res;
};
apiGetUserListing.queryKey = '/user/listing';

export const apiUpdateUser = async (req: {
  id: number;
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: 'student' | 'teacher' | 'admin';
}) => {
  const res = await callAPIHandler<User>('post', '/user/update', req, true);
  return res;
};

export const apiDeleteUser = async (req: { id: number }) => {
  const res = await callAPIHandler('post', '/user/delete', req, true);
  return res;
};

export const apiCreateUser = async (
  req: Pick<
    User,
    'first_name' | 'last_name' | 'username' | 'password' | 'role' | 'lang'
  >,
) => {
  const res = await callAPIHandler<User>('post', '/user/create', req, true);
  return res;
};
