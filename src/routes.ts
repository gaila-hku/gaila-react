import { type RouteConfig, index, route } from '@react-router/dev/routes';
import { createSearchParams } from 'react-router';

export const pathnames = {
  home: () => '/',
  login: (redirect?: string, clear?: boolean) =>
    `/login?${createSearchParams({
      ...(redirect ? { r: redirect } : {}),
      ...(clear ? { clear: '1' } : {}),
    }).toString()}`,
  dashboard: () => '/dashboard',
  assignments: () => '/assignments',
  assignmentCreate: () => '/assignments/create',
  assignmentView: (id: string) => `/assignments/view/${id}`,
  assignmentEditDetails: (id: string) => `/assignments/edit/${id}`,
  assignmentEditSubmission: (id: string) => `/assignments/submit/${id}`,
  submissionView: (assignmentId: string, studentId: string) =>
    `/submission/${assignmentId}/${studentId}`,
  classDetails: (id: string) => `/class/${id}`,
  adminPortal: () => '/admin',
  adminUserManagement: () => '/admin/users',
  adminClassManagement: () => '/admin/classes',
  adminAgentConfig: () => '/admin/agents',
  adminTraceLogs: () => '/admin/logs',
};

export default [
  index('pages/home.tsx'),
  route(pathnames.login(), 'pages/login.tsx'),
  route(pathnames.dashboard(), 'pages/dashboard.tsx'),
  route(pathnames.assignments(), 'pages/assignments.tsx'),
  route(pathnames.assignmentView(':id'), 'pages/assignments.view.tsx'),
  route(pathnames.assignmentCreate(), 'pages/assignments.create.tsx'),
  route(pathnames.assignmentEditDetails(':id'), 'pages/assignments.edit.tsx'),
  route(
    pathnames.assignmentEditSubmission(':id'),
    'pages/assignments.submit.tsx',
  ),
  route(
    pathnames.submissionView(':assignmentId', ':studentId'),
    'pages/submission.view.tsx',
  ),
  route(pathnames.classDetails(':id'), 'pages/class.tsx'),
  route(pathnames.adminPortal(), 'pages/admin.tsx'),
  route(pathnames.adminUserManagement(), 'pages/admin.user.tsx'),
  route(pathnames.adminClassManagement(), 'pages/admin.class.tsx'),
  route(pathnames.adminAgentConfig(), 'pages/admin.agent.tsx'),
  route(pathnames.adminTraceLogs(), 'pages/admin.logs.tsx'),
] satisfies RouteConfig;
