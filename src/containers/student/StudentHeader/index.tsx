import React, { useCallback } from 'react';

import { LogOut, Settings, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { pathnames } from 'routes';

import DropdownMenu from 'components/navigation/DropdownMenu';

import useAuth from 'containers/auth/AuthProvider/useAuth';
import Logo from 'containers/common/Logo';
import AssignmentSubmissionStepper from 'containers/student/StudentHeader/AssignmentSubmissionStepper';
import StudentHeaderNavigation from 'containers/student/StudentHeader/StudentHeaderNavigation';
import StudentHeaderNotifications from 'containers/student/StudentHeader/StudentHeaderNotifications';

import getUserName from 'utils/helper/getUserName';
import useProfile from 'utils/hooks/useProfile';

export function StudentHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutAction } = useAuth();

  const { data: profile, isLoading } = useProfile();

  const onClickProfileMenu = useCallback(
    (key: string) => {
      if (key === 'profile') {
        navigate(pathnames.profile());
      } else if (key === 'logout') {
        logoutAction();
      }
    },
    [logoutAction, navigate],
  );

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-4 max-w-full mx-auto">
        <div className="flex items-center justify-between">
          <Logo />
          {location.pathname.startsWith(
            pathnames.assignmentEditSubmission(''),
          ) ? (
            <AssignmentSubmissionStepper />
          ) : (
            <StudentHeaderNavigation />
          )}

          <div className="flex-shrink-0 w-[250px] flex gap-4 justify-end">
            <StudentHeaderNotifications />
            <DropdownMenu
              items={[
                {
                  type: 'text',
                  label: isLoading
                    ? 'Loading...'
                    : profile
                      ? getUserName(profile)
                      : '-',
                },
                { type: 'divider' },
                {
                  key: 'profile',
                  icon: <Settings className="h-4 w-4" />,
                  label: 'Edit Profile',
                },
                {
                  key: 'logout',
                  icon: <LogOut className="h-4 w-4" />,
                  label: 'Logout',
                },
              ]}
              onClick={onClickProfileMenu}
            >
              <User className="h-4 w-4" />
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default StudentHeader;
