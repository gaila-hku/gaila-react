import React, { useEffect } from 'react';

import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import redirectToLoginPage from 'containers/auth/AuthProvider/redirectToLoginPage';
import useAuth from 'containers/auth/AuthProvider/useAuth';

type Props = {
  children: React.ReactNode;
  isStudentPage?: boolean;
  isTeacherPage?: boolean;
  isAdminPage?: boolean;
};

const AuthPageWrapper = ({
  isStudentPage,
  isTeacherPage,
  isAdminPage,
  children,
}: Props) => {
  const { isInitialized, isLoaded, isLoggedIn, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized || !isLoaded) {
      return;
    }
    if (!isLoggedIn || !role) {
      redirectToLoginPage(false, 'private');
      return;
    }
    if (
      (isTeacherPage && role === 'student') ||
      (isStudentPage && role !== 'student') ||
      (isAdminPage && role !== 'admin')
    ) {
      navigate(pathnames.home(), { replace: true });
      return;
    }
  }, [
    isAdminPage,
    isInitialized,
    isLoaded,
    isLoggedIn,
    isStudentPage,
    isTeacherPage,
    navigate,
    role,
  ]);

  if (!isLoaded || !isLoggedIn || !role) {
    return null;
  }

  return <>{children}</>;
};

export default AuthPageWrapper;
