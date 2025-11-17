import React, { useCallback, useEffect, useState } from 'react';

import {
  BarChart3,
  Bell,
  FileText,
  LogOut,
  Settings,
  TriangleAlert,
  User,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Button from 'components/input/Button';
import DropdownMenu from 'components/navigation/DropdownMenu';

import useAuth from 'containers/auth/AuthProvider/useAuth';
import Logo from 'containers/common/Logo';
import AssignmentSubmissionStepper from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionStepper';

// FIXME: api
const notifications = [
  {
    id: 1,
    message:
      'You have a reminder from your teacher: Your "Climate Change Impact Essay" has a high AI usage of 41%.',
    type: 'alert',
  },
];

type StudentCurrentView = 'home' | 'analytics';

export function StudentHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutAction } = useAuth();

  const [currentView, setCurrentView] = useState<StudentCurrentView>('home');
  useEffect(() => {
    if (location.pathname === pathnames.home()) {
      setCurrentView('home');
    } else if (location.pathname === pathnames.analytics()) {
      setCurrentView('analytics');
    }
  }, [location.pathname]);

  const onViewChange = useCallback(
    (view: StudentCurrentView) => {
      if (view === 'analytics') {
        navigate(pathnames.analytics());
        return;
      }
      navigate(pathnames.home());
    },
    [navigate],
  );

  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'alert':
        return <TriangleAlert className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  }, []);

  // TODO: profile edit, profile details in menu
  const onClickProfileMenu = useCallback(
    (key: string) => {
      if (key === 'profile') {
        alert('Profile editing feature coming soon!');
      } else if (key === 'logout') {
        logoutAction();
      }
    },
    [logoutAction],
  );

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-4 max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between">
          <Logo />
          {location.pathname.startsWith(
            pathnames.assignmentEditSubmission(''),
          ) ? (
            <AssignmentSubmissionStepper />
          ) : (
            <nav className="flex items-center gap-4">
              <Button
                className="gap-2 w-full sm:w-auto justify-start"
                onClick={() => onViewChange('home')}
                variant={currentView === 'home' ? 'default' : 'ghost'}
              >
                <FileText className="h-4 w-4" />
                My Assignments
              </Button>
              <Button
                className="gap-2 w-full sm:w-auto justify-start"
                onClick={() => onViewChange('analytics')}
                variant={currentView === 'analytics' ? 'default' : 'ghost'}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </nav>
          )}

          <div className="flex-shrink-0 w-[250px] flex gap-4 justify-end">
            <DropdownMenu
              items={[
                { type: 'text', label: 'Notifications' },
                { type: 'divider' },
                ...notifications.map(notification => ({
                  key: notification.id,
                  icon: getNotificationIcon(notification.type),
                  label: notification.message,
                })),
              ]}
            >
              <Bell className="h-4 w-4" />
            </DropdownMenu>
            <DropdownMenu
              items={[
                { type: 'text', label: 'My Account' },
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
