import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Provider } from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/context';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentEssayContent,
  AssignmentGoalContent,
} from 'types/assignment';

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

  const essayContent = useRef<Omit<AssignmentEssayContent, 'goals' | 'title'>>({
    outline: '',
    essay: '',
  });
  const [goalContent, setGoalContent] = useState<AssignmentGoalContent | null>(
    null,
  );

  const getEssayContent = useCallback(() => {
    return essayContent.current.essay;
  }, []);

  const getEssayWordCount = useCallback((essay?: string) => {
    if (essay) {
      return essay
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;
    }
    return essayContent.current.essay
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
        setGoalContent(goalStage.submission.content as AssignmentGoalContent);
      }
      return;
    }

    try {
      const submissionContent = submission.content as AssignmentEssayContent;
      essayContent.current = submissionContent;
      setGoalContent(submissionContent.goals || null);
    } catch (e) {
      console.error(e);
    }
  }, [assignmentProgress, currentStage, essayContent, setGoalContent]);

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
      goalContent,
      setGoalContent,
      readonly,
    }),
    [
      assignment,
      assignmentProgress,
      currentStage,
      error,
      getEssayContent,
      getEssayWordCount,
      goalContent,
      isLoading,
      readonly,
      teacherGrade,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentEssayEditorProvider;
