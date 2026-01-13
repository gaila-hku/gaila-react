import React, { useCallback, useEffect, useState } from 'react';

import { BarChart3, FileText } from 'lucide-react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Button from 'components/input/Button';

import { apiSaveTraceData } from 'api/trace-data';

type StudentCurrentView = 'home' | 'dashboard';

const StudentHeaderNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: saveTraceData } = useMutation(apiSaveTraceData);

  const [currentView, setCurrentView] = useState<StudentCurrentView>('home');
  useEffect(() => {
    if (location.pathname === pathnames.home()) {
      setCurrentView('home');
    } else if (location.pathname === pathnames.dashboard()) {
      setCurrentView('dashboard');
    }
  }, [location.pathname]);

  const onViewChange = useCallback(
    (view: StudentCurrentView) => {
      if (view === 'dashboard') {
        saveTraceData({
          assignment_id: null,
          stage_id: null,
          action: 'ENTER_DASHBOARD',
          content: JSON.stringify({}),
        });
        navigate(pathnames.dashboard());
        return;
      }
      if (currentView === 'dashboard') {
        saveTraceData({
          assignment_id: null,
          stage_id: null,
          action: 'LEAVE_DASHBOARD',
          content: JSON.stringify({}),
        });
      }
      navigate(pathnames.home());
    },
    [currentView, navigate, saveTraceData],
  );

  return (
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
        onClick={() => onViewChange('dashboard')}
        variant={currentView === 'dashboard' ? 'default' : 'ghost'}
      >
        <BarChart3 className="h-4 w-4" />
        Dashboard
      </Button>
    </nav>
  );
};

export default StudentHeaderNavigation;
