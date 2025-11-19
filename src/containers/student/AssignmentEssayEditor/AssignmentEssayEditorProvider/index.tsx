import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Provider } from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/context';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentEssayContent, AssignmentGoal } from 'types/assignment';

type Props = {
  children: React.ReactNode;
};

const AssignmentEssayEditorProvider = ({ children }: Props) => {
  const {
    assignmentProgress,
    currentStage,
    isLoading,
    error,
    assignment,
    teacherGrade,
    readonly,
  } = useAssignmentSubmissionProvider();

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

  useEffect(() => {
    if (!assignmentProgress || !currentStage) {
      return;
    }

    const submission = currentStage.submission;

    if (!submission) {
      const goalStage = assignmentProgress.stages.find(stage => {
        return stage.stage_type === 'goal_setting';
      });
      if (goalStage?.submission) {
        setGoals(goalStage.submission.content as AssignmentGoal[]);
      }
      return;
    }

    try {
      const submissionContent = submission.content as AssignmentEssayContent;
      essayContent.current = submissionContent.content || '';
      setGoals(submissionContent.goals || []);
    } catch (e) {
      console.error(e);
    }
  }, [assignmentProgress, currentStage, essayContent, setGoals]);

  const value = useMemo(
    () => ({
      assignmentProgress,
      isLoading,
      error,
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
      error,
      getEssayContent,
      getEssayWordCount,
      goals,
      isLoading,
      readonly,
      teacherGrade,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentEssayEditorProvider;
