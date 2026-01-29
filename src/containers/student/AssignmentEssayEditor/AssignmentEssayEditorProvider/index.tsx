import React, { useEffect, useMemo, useState } from 'react';

import { AlertTriangle } from 'lucide-react';

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
  const {
    assignmentProgress,
    currentStage,
    readonly: providerReadonly,
    readonlyMessage: providerReadonlyMessage,
    outliningEnabled,
    revisingEnabled,
  } = useAssignmentSubmissionProvider();

  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [essay, setEssay] = useState('');
  const [outlineConfirmed, setOutlineConfirmed] = useState(false);
  const [draftConfirmed, setDraftConfirmed] = useState(false);

  const [essayInit, setEssayInit] = useState(false);

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
      const currentContent = currentStage.submission?.content as
        | AssignmentDraftingContent
        | undefined;
      setTitle(currentContent?.title || '');
      setEssay(currentContent?.essay || '');
    } else if (
      !currentStage?.submission &&
      currentStage?.stage_type === 'revising'
    ) {
      const draftingContent = draftingStage?.submission?.content as
        | AssignmentDraftingContent
        | undefined;
      setTitle(draftingContent?.title || '');
      setEssay(draftingContent?.essay || '');
    }
    setEssayInit(true);
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

  const [readonly, readonlyMessage] = useMemo(() => {
    if (providerReadonly) {
      return [true, providerReadonlyMessage];
    }
    if (
      currentStage?.stage_type === 'drafting' &&
      outliningEnabled &&
      !outlineConfirmed
    ) {
      return [
        true,
        {
          title: 'Outline Required',
          longMessage:
            'You must complete and confirm your outline before you can start drafting your essay.',
          shortMessage: 'Please complete your outline first.',
          icon: <AlertTriangle className="h-5 w-5" />,
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-600',
        },
      ];
    }
    if (
      currentStage?.stage_type === 'revising' &&
      revisingEnabled &&
      !draftConfirmed
    ) {
      return [
        true,
        {
          title: 'Draft Required',
          longMessage:
            'You must complete and confirm your draft before you can start revising your essay.',
          shortMessage: 'Please complete your draft first.',
          icon: <AlertTriangle className="h-5 w-5" />,
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-600',
        },
      ];
    }
    return [false, null];
  }, [
    currentStage?.stage_type,
    draftConfirmed,
    outlineConfirmed,
    outliningEnabled,
    providerReadonly,
    providerReadonlyMessage,
    revisingEnabled,
  ]);

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
      readonly,
      readonlyMessage,
      essayInit,
    }),
    [
      assignmentProgress,
      currentStage,
      title,
      outline,
      essay,
      outlineConfirmed,
      draftConfirmed,
      goalContent,
      nextStageType,
      readonly,
      readonlyMessage,
      essayInit,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AssignmentEssayEditorProvider;
