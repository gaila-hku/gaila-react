import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Provider } from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/context';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentGoal } from 'types/assignment';

type Props = {
  children: React.ReactNode;
};

const AssignmentEssayEditorProvider = ({ children }: Props) => {
  const { assignmentProgress, currentStage } =
    useAssignmentSubmissionProvider();

  const essayContent = useRef('');
  const [goals, setGoals] = useState<AssignmentGoal[]>([]);

  const getEssayContent = useCallback(() => {
    return essayContent.current;
  }, []);

  const getEssayWordCount = useCallback((essay?: string) => {
    if (essay) {
      return essay
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;
    }
    return essayContent.current
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }, []);

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
      assignmentProgress,
      currentStage,
      assignment,
      teacherGrade,
      essayContent,
      getEssayContent,
      getEssayWordCount,
      goals,
      setGoals,
      readonly,
    }),
    [
      assignment,
      assignmentProgress,
      currentStage,
      getEssayContent,
      getEssayWordCount,
      goals,
      readonly,
      teacherGrade,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentEssayEditorProvider;
