import React, { useEffect, useMemo, useRef, useState } from 'react';

import { isNumber } from 'lodash-es';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import useAlert from 'containers/common/AlertProvider/useAlert';
import { Provider } from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/context';

import {
  apiSaveAssignmentSubmission,
  apiViewAssignmentProgress,
} from 'api/assignment';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
  children: React.ReactNode;
};

const AssignmentSubmissionProvider = ({ assignmentId, children }: Props) => {
  const queryClient = useQueryClient();
  const { successMsg, errorMsg } = useAlert();

  const {
    data: assignmentProgress,
    isLoading,
    error,
  } = useQuery(
    tuple([apiViewAssignmentProgress.queryKey, assignmentId]),
    apiViewAssignmentProgress,
    { enabled: !!isNumber(assignmentId) },
  );

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const initStageIndex = useRef(false);
  useEffect(() => {
    if (initStageIndex.current || !assignmentProgress) {
      return;
    }
    setCurrentStageIndex(Math.max(assignmentProgress.current_stage, 0));
    initStageIndex.current = true;
  }, [assignmentProgress]);

  const currentStage = useMemo(() => {
    if (!assignmentProgress) {
      return null;
    }

    return assignmentProgress.stages[currentStageIndex];
  }, [assignmentProgress, currentStageIndex]);

  const { mutate: saveSubmission, isLoading: isSaving } = useMutation(
    apiSaveAssignmentSubmission,
    {
      onSuccess: async (res, req) => {
        const currentContent =
          currentStage?.stage_type === 'goal_setting'
            ? 'Goals'
            : currentStage?.stage_type === 'writing'
              ? 'Essay'
              : 'Reflections';

        if (req.refetchProgress) {
          queryClient.invalidateQueries([apiViewAssignmentProgress.queryKey]);
        }

        if (res.is_final) {
          successMsg(`${currentContent} submitted.`);
          await queryClient.invalidateQueries([
            apiViewAssignmentProgress.queryKey,
          ]);
          return;
        }
        if (req.alertMsg) {
          successMsg(req.alertMsg);
        }
      },
      onError: e => errorMsg(e),
    },
  );

  const [assignment, teacherGrade] = useMemo(() => {
    if (!assignmentProgress || !currentStage) {
      return [null, null];
    }
    const grade = currentStage.grade;
    return [assignmentProgress.assignment, grade];
  }, [assignmentProgress, currentStage]);
  const readonly = !!teacherGrade || assignmentProgress?.is_finished || false;

  const value = useMemo(
    () => ({
      assignmentProgress: assignmentProgress,
      currentStage,
      assignment,
      teacherGrade,
      readonly,
      setCurrentStageIndex,
      isLoading,
      error,
      saveSubmission,
      isSaving,
    }),
    [
      assignment,
      assignmentProgress,
      currentStage,
      error,
      isLoading,
      isSaving,
      readonly,
      saveSubmission,
      teacherGrade,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentSubmissionProvider;
