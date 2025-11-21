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

// export interface CmsUserProfile {
//   id: string;
//   name: string;
//   is_superadmin?: boolean;
//   permissions:
//     | {
//         [module: string]: string[];
//       }
//     | undefined;
//   cms_user_group:
//     | {
//         [groupKey: string]: string;
//       }
//     | undefined;
// }

// export const apiGetProfile = (): Promise<CmsUserProfile> =>
//   callAPIHandler('get', '/user_auth/profile', {}, true, {
//     redirect: false,
//     cache: 604800000,
//   });
// apiGetProfile.queryKey = 'get,/user_auth/profile';

// export interface UpdateProfileParam {
//   new_password?: string;
//   current_password?: string;
// }

// export const apiUpdateProfile = (
//   newProfileData: UpdateProfileParam,
// ): Promise<{ success: true }> => {
//   return callAPIHandler(
//     'post',
//     '/user_auth/profile/update',
//     newProfileData,
//     true,
//   );
// };

// // MFA
// export const apiUserMfaVerify = ({
//   salt,
//   verificationCode,
//   channel,
// }: {
//   salt: string;
//   verificationCode: string;
//   channel: string;
// }): Promise<ServerAuthToken | MFAResponse> =>
//   callAPIHandler(
//     'post',
//     '/user_auth/verify-mfa',
//     {
//       salt,
//       verification_code: verificationCode,
//       fa_channel: channel,
//     },
//     false,
//   );

// export const apiUserMfaRequest = ({
//   salt,
// }: {
//   salt: string;
// }): Promise<MFAResponse> =>
//   callAPIHandler('post', '/user_auth/request-mfa', { salt }, false);

// // Forget Password
// export const apiUserForgetPassword = ({
//   email,
// }: {
//   email: string;
// }): Promise<MFAResponse> =>
//   callAPIHandler('post', '/user_auth/forgot-password', { email }, false);

// export const apiUserChangePassword = ({
//   email,
//   verify,
//   password,
// }: {
//   email: string;
//   verify: string;
//   password: string;
// }): Promise<MFAResponse> =>
//   callAPIHandler(
//     'post',
//     '/user_auth/forgot-password',
//     { email, verify, password },
//     false,
//   );
