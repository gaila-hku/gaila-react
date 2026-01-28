import React, { useEffect, useMemo, useRef, useState } from 'react';

import dayjs from 'dayjs';
import { isNumber } from 'lodash-es';
import { CheckCircle } from 'lucide-react';
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
    const currentStage =
      assignmentProgress.stages[assignmentProgress.current_stage];
    const enabledStages = assignmentProgress.stages.filter(s => s.enabled);
    setCurrentStageIndex(enabledStages.indexOf(currentStage));
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

        if (req.changeStage) {
          initStageIndex.current = false;
        }

        if (req.refetchProgress) {
          queryClient.invalidateQueries([apiViewAssignmentProgress.queryKey]);
        }

        if (res.is_final && req.stage_id === currentStage?.id) {
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
    if (!assignmentProgress) {
      return [null, null];
    }
    const grade = assignmentProgress.stages.find(s => !!s.grade)?.grade || null;
    return [assignmentProgress.assignment, grade];
  }, [assignmentProgress]);

  const [readonly, readonlyMessage] = useMemo(() => {
    if (teacherGrade) {
      return [
        true,
        {
          title: 'Essay Graded',
          longMessage: `This essay has been graded by ${teacherGrade.graded_by} on ${dayjs(teacherGrade.graded_at).format('DD MMM YYYY')}. You can view your grade in the Requirements tab, but editing and tools are now disabled. You can still use the AI Chat for learning purposes.`,
          shortMessage:
            'This essay has been graded and can no longer be edited.',
          icon: <CheckCircle className="h-5 w-5" />,
          bgClass: 'bg-purple-50 border-purple-200',
          textClass: 'text-purple-600',
        },
      ];
    }
    if (assignmentProgress?.is_finished) {
      return [
        true,
        {
          title: 'Essay Submitted',
          longMessage:
            ' You have already submitted your essay. Your teacher will grade ir soon. While you wait, you can review your essay and use the AI Chat for learning purposes.',
          shortMessage:
            'This essay has been submitted and can no longer be edited.',
          icon: <CheckCircle className="h-5 w-5" />,
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-600',
        },
      ];
    }
    return [false, null];
  }, [assignmentProgress?.is_finished, teacherGrade]);

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
      readonlyMessage,
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
      readonlyMessage,
      revisingEnabled,
      saveSubmission,
      teacherGrade,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentSubmissionProvider;
