import React, { useEffect, useMemo, useState } from 'react';

import { isNumber } from 'lodash-es';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import useAlert from 'containers/common/AlertProvider/useAlert';
import { Provider } from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/context';

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
  useEffect(() => {
    if (assignmentProgress) {
      setCurrentStageIndex(Math.max(assignmentProgress.current_stage, 0));
    }
  }, [assignmentProgress]);

  const isStepperClickable = useMemo(() => {
    if (!assignmentProgress) {
      return false;
    }
    return (
      assignmentProgress.stages.some(stage => !!stage.grade) ||
      assignmentProgress.stages.every(
        stage => stage.submission && stage.submission.is_final,
      )
    );
  }, [assignmentProgress]);

  const currentStage = useMemo(() => {
    if (!assignmentProgress) {
      return null;
    }

    return assignmentProgress.stages[currentStageIndex];
  }, [assignmentProgress, currentStageIndex]);

  const { mutate: saveSubmission } = useMutation(apiSaveAssignmentSubmission, {
    onSuccess: async (res, req) => {
      const currentContent =
        currentStage?.stage_type === 'goal_setting'
          ? 'Goals'
          : currentStage?.stage_type === 'writing'
            ? 'Essay'
            : 'Reflections';
      if (res.is_final) {
        successMsg(`${currentContent} submitted.`);
        await queryClient.invalidateQueries([
          apiViewAssignmentProgress.queryKey,
        ]);
        return;
      }
      if (req.is_manual) {
        successMsg(`${currentContent} draft saved.`);
      }
    },
    onError: errorMsg,
  });

  const value = useMemo(
    () => ({
      assignmentProgress: assignmentProgress,
      isStepperClickable,
      currentStage,
      setCurrentStageIndex,
      isLoading,
      error,
      saveSubmission,
    }),
    [
      assignmentProgress,
      currentStage,
      error,
      isLoading,
      isStepperClickable,
      saveSubmission,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentSubmissionProvider;
