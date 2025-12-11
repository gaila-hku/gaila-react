import React, { useEffect, useMemo, useState } from 'react';

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

  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [essay, setEssay] = useState('');
  const [outlineConfirmed, setOutlineConfirmed] = useState(false);
  const [draftConfirmed, setDraftConfirmed] = useState(false);

  const [goalContent, setGoalContent] = useState<AssignmentGoalContent | null>(
    null,
  );

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
      setEssay(submissionContent.essay);
      setOutlineConfirmed(submissionContent.outline_confirmed);
      setDraftConfirmed(submissionContent.draft_confirmed);
      setGoalContent(submissionContent.goals || null);
    } catch (e) {
      console.error(e);
    }
  }, [assignmentProgress, currentStage, setGoalContent]);

  const value = useMemo(
    () => ({
      assignmentProgress,
      isLoading,
      error,
      currentStage,
      assignment,
      teacherGrade,
      title,
      setTitle,
      outline,
      setOutline,
      essay,
      setEssay,
      outlineConfirmed,
      setOutlineConfirmed,
      draftConfirmed,
      setDraftConfirmed,
      goalContent,
      setGoalContent,
      readonly,
    }),
    [
      assignment,
      assignmentProgress,
      currentStage,
      draftConfirmed,
      error,
      essay,
      goalContent,
      isLoading,
      outline,
      outlineConfirmed,
      readonly,
      teacherGrade,
      title,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentEssayEditorProvider;
