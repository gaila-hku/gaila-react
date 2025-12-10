import React, { useEffect, useRef } from 'react';

import { useMutation } from 'react-query';
import { useLocation } from 'react-router';

import useAuth from 'containers/auth/AuthProvider/useAuth';

import { apiSaveTraceData } from 'api/trace-data';
import type { AssignmentProgress } from 'types/assignment';

const usePageTracking = (
  assignmentProgress: AssignmentProgress | undefined,
) => {
  const location = useLocation();
  const { token } = useAuth();

  const isFirstLoad = useRef(true);
  const isFirstLoadLoading = useRef(false);
  const isUnload = useRef(false);
  const assignmentId = useRef<number | null>(null);
  const stageId = useRef<number | null>(null);

  const { mutateAsync: saveTraceData } = useMutation(apiSaveTraceData);

  // 1. Trace enter page
  useEffect(() => {
    if (!assignmentProgress) {
      return;
    }

    assignmentId.current = assignmentProgress.assignment.id;
    stageId.current =
      assignmentProgress.stages[assignmentProgress.current_stage].id;
    if (isFirstLoad.current && !isFirstLoadLoading.current) {
      isFirstLoadLoading.current = true;
      (async () => {
        await saveTraceData({
          assignment_id: assignmentId.current || null,
          stage_id: stageId.current || null,
          action: 'ENTER_ASSIGNMENT',
        });
        isFirstLoad.current = false;
        isFirstLoadLoading.current = false;
      })();
    }
  }, [assignmentProgress, saveTraceData]);

  // 2. Track navigate away from page
  useEffect(() => {
    return () => {
      if (!isFirstLoad.current) {
        saveTraceData({
          assignment_id: assignmentId.current || null,
          stage_id: stageId.current || null,
          action: 'LEAVE_ASSIGNMENT',
        });
      }
    };
  }, [location.pathname, saveTraceData]);

  // 3. Track tab switch and close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      isUnload.current = true;
      saveTraceData({
        assignment_id: assignmentId.current || null,
        stage_id: stageId.current || null,
        action: 'CLOSE_TAB',
      });
    };

    const handleVisibilityChange = () => {
      if (isUnload.current) {
        return;
      }
      if (document.visibilityState === 'hidden') {
        saveTraceData({
          assignment_id: assignmentId.current || null,
          stage_id: stageId.current || null,
          action: 'SWITCH_TO_OTHER_TAB',
        });
      } else {
        saveTraceData({
          assignment_id: assignmentId.current || null,
          stage_id: stageId.current || null,
          action: 'SWITCH_TO_THIS_TAB',
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveTraceData, token]);
};

export default usePageTracking;
