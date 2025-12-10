import { callAPIHandler } from 'api/_base';

export const apiGetVersion = async () => {
  const res = await callAPIHandler<{ version: string }>(
    'get',
    '/version',
    {},
    true,
  );
  return res;
};
apiGetVersion.queryKey = '/version';
