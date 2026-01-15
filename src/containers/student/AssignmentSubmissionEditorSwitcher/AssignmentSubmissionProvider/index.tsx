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

    return assignmentProgress.stages.filter(s => s.enabled)[currentStageIndex];
  }, [assignmentProgress, currentStageIndex]);

  const { mutate: saveSubmission, isLoading: isSaving } = useMutation(
    apiSaveAssignmentSubmission,
    {
      onSuccess: async (res, req) => {
        let currentContent = 'Progress';
        switch (currentStage?.stage_type) {
          case 'goal_setting':
            currentContent = 'Goals';
            break;
          case 'outlining':
            currentContent = 'Outline';
            break;
          case 'drafting':
          case 'revising':
            currentContent = 'Draft';
            break;
          case 'reflection':
            currentContent = 'Reflections';
            break;
        }

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

  const readonly =
    !!teacherGrade ||
    assignmentProgress?.is_finished ||
    currentStage?.submission?.is_final ||
    false;

  const [outliningEnabled, revisingEnabled] = useMemo(
    () => [
      assignmentProgress?.stages.some(
        stage => stage.stage_type === 'outlining' && stage.enabled,
      ) || false,
      assignmentProgress?.stages.some(
        stage => stage.stage_type === 'revising' && stage.enabled,
      ) || false,
    ],
    [assignmentProgress?.stages],
  );

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
      outliningEnabled,
      revisingEnabled,
    }),
    [
      assignment,
      assignmentProgress,
      currentStage,
      error,
      isLoading,
      isSaving,
      outliningEnabled,
      readonly,
      revisingEnabled,
      saveSubmission,
      teacherGrade,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentSubmissionProvider;
