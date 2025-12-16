import React, { useCallback, useEffect, useState } from 'react';

import { BarChart3, FileText, LogOut, User, Users, Wrench } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Button from 'components/input/Button';
import DropdownMenu from 'components/navigation/DropdownMenu';

import useAuth from 'containers/auth/AuthProvider/useAuth';
import Logo from 'containers/common/Logo';

type TeacherCurrentView = 'home' | 'assignments' | 'dashboard' | 'admin';

export function TeacherHeader() {
  const { logoutAction, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentView, setCurrentView] = useState<TeacherCurrentView | null>(
    null,
  );
  useEffect(() => {
    switch (location.pathname) {
      case pathnames.home():
        setCurrentView('home');
        break;
      case pathnames.assignments():
        setCurrentView('assignments');
        break;
      case pathnames.dashboard():
        setCurrentView('dashboard');
        break;
      case pathnames.adminPortal():
        setCurrentView('admin');
        break;
      default:
        setCurrentView(null);
    }
  }, [location.pathname]);

  const onViewChange = useCallback(
    (view: TeacherCurrentView) => {
      if (view === currentView) {
        return;
      }
      switch (view) {
        case 'home':
          navigate(pathnames.home());
          return;
        case 'assignments':
          navigate(pathnames.assignments());
          return;
        case 'dashboard':
          navigate(pathnames.dashboard());
          return;
        case 'admin':
          if (role === 'admin') {
            navigate(pathnames.adminPortal());
          }
          return;
      }
    },
    [currentView, navigate, role],
  );

  // TODO: profile edit, profile details in menu
  const handleMenuClick = useCallback(
    (key: string) => {
      if (key === 'profile') {
        window.alert('Profile editing coming soon!');
      } else if (key === 'logout') {
        logoutAction();
      }
    },
    [logoutAction],
  );

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-4 max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between gap-4 relative">
          <Logo />

          {/* Centered Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button
              className="gap-2"
              onClick={() => onViewChange('home')}
              size="sm"
              variant={currentView === 'home' ? 'default' : 'ghost'}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">My Classes</span>
            </Button>
            <Button
              className="gap-2"
              onClick={() => onViewChange('assignments')}
              size="sm"
              variant={currentView === 'assignments' ? 'default' : 'ghost'}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
            </Button>
            {/* TODO: Dashboard */}
            {/* <Button
              className="gap-2"
              onClick={() => onViewChange('dashboard')}
              size="sm"
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button> */}
            {role === 'admin' && (
              <Button
                className="gap-2"
                onClick={() => onViewChange('admin')}
                size="sm"
                variant={currentView === 'admin' ? 'default' : 'ghost'}
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Site Management</span>
              </Button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex-shrink-0 w-[250px] flex justify-end">
            <DropdownMenu
              items={[
                {
                  type: 'text',
                  label: (
                    <div className="flex flex-col space-y-1">
                      <p>Teacher Name</p>
                      <p className="text-xs text-muted-foreground">
                        teacher@school.edu
                      </p>
                    </div>
                  ),
                },
                { type: 'divider' },
                {
                  key: 'profile',
                  icon: <User className="h-4 w-4" />,
                  label: <span>Edit Profile</span>,
                },
                {
                  key: 'logout',
                  icon: <LogOut className="h-4 w-4" />,
                  label: <span>Logout</span>,
                },
              ]}
              onClick={handleMenuClick}
            >
              <User className="h-4 w-4" />
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TeacherHeader;
