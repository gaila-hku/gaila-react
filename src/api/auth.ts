import type { Role } from '../containers/auth/AuthProvider/context';
import { callAPIHandler } from './_base';

export interface ServerAuthToken {
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  serverTime: number;
  role: Role;
  lang: string;
}

export const apiUserLogin = ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<ServerAuthToken> =>
  callAPIHandler('post', '/auth/login', { username, password }, false);

export const apiUserRefreshToken = (
  refreshToken: string,
): Promise<ServerAuthToken> =>
  callAPIHandler('post', '/auth/refresh', { refreshToken }, false);
