import React, { useEffect, useMemo, useState } from 'react';

import { Provider } from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/context';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentDraftingContent,
  AssignmentGoalContent,
  AssignmentOutliningContent,
} from 'types/assignment';

type Props = {
  children: React.ReactNode;
};

const AssignmentEssayEditorProvider = ({ children }: Props) => {
  const { assignmentProgress, currentStage } =
    useAssignmentSubmissionProvider();

  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [essay, setEssay] = useState('');
  const [outlineConfirmed, setOutlineConfirmed] = useState(false);
  const [draftConfirmed, setDraftConfirmed] = useState(false);

  const [goalContent, setGoalContent] = useState<AssignmentGoalContent | null>(
    null,
  );

  useEffect(() => {
    if (!assignmentProgress) {
      return;
    }

    // 1. Init goal content
    const goalStage = assignmentProgress.stages.find(stage => {
      return stage.stage_type === 'goal_setting';
    });
    if (goalStage?.submission) {
      setGoalContent(goalStage.submission.content as AssignmentGoalContent);
    }

    // 2. Init outline
    const outliningStage = assignmentProgress.stages.find(stage => {
      return stage.stage_type === 'outlining';
    });
    if (outliningStage?.submission) {
      const outlineContent = outliningStage.submission
        .content as AssignmentOutliningContent;
      setOutline(outlineContent.outline);
      setOutlineConfirmed(outliningStage.submission.is_final || false);
    }

    const draftingStage = assignmentProgress.stages.find(stage => {
      return stage.stage_type === 'drafting';
    });
    if (draftingStage?.submission) {
      setDraftConfirmed(draftingStage.submission.is_final || false);
    }

    // 3. Init essay and title
    if (
      !!currentStage?.submission &&
      (currentStage.stage_type === 'drafting' ||
        currentStage.stage_type === 'revising')
    ) {
      const currentContent = currentStage.submission
        ?.content as AssignmentDraftingContent;
      setTitle(currentContent.title);
      setEssay(currentContent.essay);
    }
  }, [assignmentProgress, currentStage, setGoalContent]);

  const nextStageType = useMemo(() => {
    if (!assignmentProgress) {
      return null;
    }
    return (
      assignmentProgress.stages[assignmentProgress.current_stage + 1]
        ?.stage_type || null
    );
  }, [assignmentProgress]);

  const value = useMemo(
    () => ({
      assignmentProgress,
      currentStage,
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
      nextStageType,
    }),
    [
      assignmentProgress,
      currentStage,
      draftConfirmed,
      essay,
      goalContent,
      outline,
      outlineConfirmed,
      title,
      nextStageType,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentEssayEditorProvider;
