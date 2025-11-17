import React, { useEffect, useMemo, useState } from 'react';

import { isNumber } from 'lodash-es';
import { useQuery } from 'react-query';

import { Provider } from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/context';

import { apiViewAssignmentProgress } from 'api/assignment';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
  children: React.ReactNode;
};

const AssignmentSubmissionProvider = ({ assignmentId, children }: Props) => {
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

  const value = useMemo(
    () => ({
      assignmentProgress: assignmentProgress,
      isStepperClickable,
      currentStage,
      setCurrentStageIndex,
      isLoading,
      error,
    }),
    [assignmentProgress, currentStage, error, isLoading, isStepperClickable],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentSubmissionProvider;
