import React, { useCallback, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { defaultsDeep } from 'lodash-es';
import { CheckCircle } from 'lucide-react';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import Tabs from 'components/navigation/Tabs';

import useAlert from 'containers/common/AlertProvider/useAlert';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import EssayEditorAIChat from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorAIChat';
import EssayEditorHeader from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorHeader';
import EssayEditorInput from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorInput';
import EssayEditorOutlineEditModal from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorOutlineEditModal';
import EssayEditorOverview from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorOverview';
import EssayEditorStageStepper from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorStageStepper';
import EssayEditorSubmitModal from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorSubmitModal';
import EssayEditorTools from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentEssayContent,
  AssignmentGoalContent,
} from 'types/assignment';
import getWordCount from 'utils/helper/getWordCount';

type WordCountStatus = {
  color: string;
  text: string;
};

function AssignmentEssayEditorMain() {
  const { assignmentProgress, currentStage, saveSubmission, isSaving } =
    useAssignmentSubmissionProvider();
  const {
    assignment,
    teacherGrade,
    title,
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
  } = useAssignmentEssayEditorProvider();

  const { alertMsg } = useAlert();

  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === 'writing_general',
  );

  const [wordCountStatus, setWordCountStatus] = useState<WordCountStatus>({
    color: '',
    text: '',
  });
  const [editOutlineModalOpen, setEditOutlineModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const updateWordCountStatus = useCallback(
    (essay: string) => {
      const wordCount = getWordCount(essay);

      const min = assignment?.requirements?.min_word_count || 0;
      const max = assignment?.requirements?.max_word_count || 0;

      if (!min && !max) {
        setWordCountStatus({
          color: 'text-gray-600',
          text: `${wordCount} word${wordCount === 1 ? '' : 's'}`,
        });
        return;
      }

      let wordCountDisplay = `${wordCount} /`;
      if (!max) {
        wordCountDisplay += ` ${min}+ words`;
      } else if (!min) {
        wordCountDisplay += ` ${max} words`;
      } else {
        wordCountDisplay += ` ${min} - ${max} words`;
      }

      if (!!min && wordCount < min) {
        setWordCountStatus({
          color: 'text-orange-600',
          text: `${wordCountDisplay} (${min - wordCount} more needed)`,
        });
      } else if (!!max && wordCount > max) {
        setWordCountStatus({
          color: 'text-red-600',
          text: `${wordCountDisplay} (${wordCount - max} over limit)`,
        });
      } else {
        setWordCountStatus({
          color: 'text-green-600',
          text: `${wordCountDisplay} (good!)`,
        });
      }
    },
    [
      assignment?.requirements?.max_word_count,
      assignment?.requirements?.min_word_count,
    ],
  );

  // Init title, outline, word count
  useEffect(() => {
    if (!assignmentProgress || !currentStage?.submission) {
      return;
    }

    try {
      const submissionContent = currentStage.submission
        .content as AssignmentEssayContent;
      setOutline(submissionContent.outline);
      updateWordCountStatus(submissionContent.essay);
    } catch (e) {
      console.error(e);
    }
  }, [assignmentProgress, currentStage, setOutline, updateWordCountStatus]);

  const saveSubmissionContent = useCallback(
    (
      newContent: Partial<AssignmentEssayContent>,
      isFinal: boolean,
      alertMsg?: string,
    ) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }

      const content = defaultsDeep(newContent, {
        title: title,
        outline: outline,
        essay: essay,
        goals: goalContent,
        outline_confirmed: outlineConfirmed,
        draft_confirmed: draftConfirmed,
      });

      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: content,
        is_final: isFinal,
        alertMsg,
      });
    },
    [
      assignmentProgress,
      currentStage,
      draftConfirmed,
      essay,
      goalContent,
      outline,
      outlineConfirmed,
      saveSubmission,
      title,
    ],
  );

  const handleAutoSave = useCallback(() => {
    saveSubmissionContent({}, false);
  }, [saveSubmissionContent]);

  const onChangeGoals = useCallback(
    (newGoals: AssignmentGoalContent) => {
      setGoalContent(newGoals);

      const goalStage = assignmentProgress?.stages.find(
        stage => stage.stage_type === 'goal_setting',
      );

      if (!assignmentProgress || !goalStage) {
        return;
      }

      const currentContent = goalStage?.submission
        ?.content as AssignmentGoalContent;

      const newContent = defaultsDeep(newGoals, currentContent);

      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: goalStage.id,
        content: newContent,
        is_final: false,
        refetchProgress: true,
      });
    },
    [assignmentProgress, saveSubmission, setGoalContent],
  );

  const handleConfirmOutline = useCallback(() => {
    if (!assignmentProgress || !currentStage) {
      return;
    }
    setOutlineConfirmed(true);
    saveSubmissionContent(
      { outline_confirmed: true },
      false,
      'You have saved your outline. You can now draft your essay.',
    );
  }, [
    assignmentProgress,
    currentStage,
    saveSubmissionContent,
    setOutlineConfirmed,
  ]);

  const checkWordCountAndAlert = useCallback(() => {
    const wordCount = getWordCount(essay);
    if (
      assignment?.requirements?.min_word_count &&
      wordCount < assignment.requirements.min_word_count
    ) {
      alertMsg(
        'Please write at least ' +
          assignment.requirements.min_word_count +
          ' words.',
      );
      return false;
    }

    if (
      assignment?.requirements?.max_word_count &&
      wordCount > assignment.requirements.max_word_count
    ) {
      alertMsg(
        'Please write no more than ' +
          assignment.requirements.max_word_count +
          ' words.',
      );
      return false;
    }
    return true;
  }, [alertMsg, assignment?.requirements, essay]);

  const handleConfirmDraft = useCallback(() => {
    if (!assignmentProgress || !currentStage) {
      return;
    }
    if (!checkWordCountAndAlert()) {
      return;
    }
    setDraftConfirmed(true);
    saveSubmissionContent(
      { draft_confirmed: true },
      false,
      'You are now at the revision stage. Use various tools to aid your revision.',
    );
  }, [
    assignmentProgress,
    checkWordCountAndAlert,
    currentStage,
    saveSubmissionContent,
    setDraftConfirmed,
  ]);

  const handleFinalSave = useCallback(() => {
    if (!checkWordCountAndAlert()) {
      return;
    }
    setSubmitModalOpen(true);
  }, [checkWordCountAndAlert]);

  const activeWritingStep: 'outline' | 'draft' | 'revision' = useMemo(() => {
    let currentStep: 'outline' | 'draft' | 'revision' = 'draft';
    if (!outlineConfirmed && assignment?.config?.outline_enabled) {
      currentStep = 'outline';
    } else if (draftConfirmed && assignment?.config?.revision_enabled) {
      currentStep = 'revision';
    }
    return currentStep;
  }, [
    assignment?.config?.outline_enabled,
    assignment?.config?.revision_enabled,
    draftConfirmed,
    outlineConfirmed,
  ]);

  const bottomButton = useMemo(() => {
    const buttonClass = 'w-full gap-2';
    switch (activeWritingStep) {
      case 'outline':
        return (
          <Button
            className={buttonClass}
            disabled={readonly || isSaving}
            onClick={handleConfirmOutline}
            size="lg"
          >
            <CheckCircle className="h-4 w-4" />
            Lock Outline & Start Drafting
          </Button>
        );
      case 'draft':
        return (
          <Button
            className={buttonClass}
            disabled={readonly || isSaving}
            onClick={handleConfirmDraft}
            size="lg"
          >
            <CheckCircle className="h-4 w-4" />
            {assignment?.config?.revision_enabled
              ? 'Confirm Draft & Start Revising'
              : 'Submit Essay'}
          </Button>
        );
      case 'revision':
        return (
          <Button
            className={buttonClass}
            disabled={readonly || isSaving}
            onClick={() => handleFinalSave()}
          >
            <CheckCircle className="h-4 w-4" />
            Finish Revising & Submit Essay
          </Button>
        );
    }
  }, [
    activeWritingStep,
    assignment?.config?.revision_enabled,
    handleConfirmDraft,
    handleConfirmOutline,
    handleFinalSave,
    isSaving,
    readonly,
  ]);

  if (!assignmentProgress || !currentStage || !assignment) {
    return <></>;
  }

  return (
    <div className="space-y-6">
      {/* Graded Status Alert */}
      {readonly && (
        <Card
          className={
            teacherGrade
              ? 'border-purple-200 bg-purple-50'
              : 'border-green-200 bg-green-50'
          }
          classes={{
            title: clsx(
              'flex items-center gap-2 text-base',
              teacherGrade ? 'text-purple-800' : 'text-green-800',
            ),
          }}
          title={
            <>
              <CheckCircle className="h-5 w-5" />
              {teacherGrade ? 'Essay Graded' : 'Essay Submitted'}
            </>
          }
        >
          {teacherGrade ? (
            <p className="text-sm text-purple-800">
              This essay has been graded by {teacherGrade.graded_by} on{' '}
              {dayjs(teacherGrade.graded_at).format('DD MMM YYYY')}. You can
              view your grade in the Requirements tab, but editing and tools are
              now disabled. You can still use the AI Chat for learning purposes.
            </p>
          ) : (
            <p className="text-sm text-green-800">
              You have already submitted your essay. Your teacher will grade it
              soon. While you wait, you can review your essay and use the AI
              Chat for learning purposes.
            </p>
          )}
        </Card>
      )}

      <ResizableSidebar>
        {/* Main Editor */}
        <div className="space-y-6">
          <EssayEditorStageStepper activeWritingStep={activeWritingStep} />

          {/* Header with save buttons */}
          <EssayEditorHeader
            saveSubmissionContent={saveSubmissionContent}
            wordCountStatus={wordCountStatus}
          />

          {/* Outline editor */}
          {assignment.config?.outline_enabled && (
            <Card
              classes={{
                description: '-mt-2 mb-2',
              }}
              description="Create a structured outline for your essay. This will help guide your writing in the next stage."
              title="Outline Your Essay"
            >
              {teacherGrade ? (
                <div className="text-xs text-purple-600">
                  This essay has been graded and can no longer be edited.
                </div>
              ) : readonly ? (
                <div className="text-xs text-green-600">
                  You have submitted your essay.
                </div>
              ) : null}
              <EssayEditorInput
                disabled={outlineConfirmed}
                handleAutoSave={handleAutoSave}
                minHeight={outlineConfirmed ? 0 : 400}
                onChange={setOutline}
                value={outline}
              />
              {outlineConfirmed && (
                <>
                  <Button
                    className="mt-3 ml-auto"
                    onClick={() => setEditOutlineModalOpen(true)}
                  >
                    Edit Outline
                  </Button>
                  <EssayEditorOutlineEditModal
                    open={editOutlineModalOpen}
                    saveSubmissionContent={saveSubmissionContent}
                    setOpen={setEditOutlineModalOpen}
                  />
                </>
              )}
            </Card>
          )}

          {/* Essay Editor */}
          {outlineConfirmed && (
            <Card title="Essay Content">
              {teacherGrade ? (
                <div className="text-xs text-purple-600">
                  This essay has been graded and can no longer be edited.
                </div>
              ) : readonly ? (
                <div className="text-xs text-green-600">
                  You have submitted your essay.
                </div>
              ) : null}
              <EssayEditorInput
                handleAutoSave={handleAutoSave}
                minHeight={600}
                onChange={setEssay}
                updateWordCountStatus={updateWordCountStatus}
                value={essay}
              />
            </Card>
          )}

          {bottomButton}
        </div>

        {/* Sidebar with Tabs */}
        <Tabs
          className="sticky top-[137px] bottom-0"
          classes={{ panel: 'overflow-auto max-h-[calc(100vh-233px)]' }}
          tabs={[
            {
              key: 'overview',
              title: readonly ? 'Grade' : 'Overview',
              content: (
                <EssayEditorOverview
                  assignment={assignment}
                  grade={teacherGrade}
                  onChangeGoals={onChangeGoals}
                  readonly={readonly}
                />
              ),
            },
            {
              key: 'tools',
              title: 'Tools',
              content: <EssayEditorTools />,
            },
            ...(generalChatTool
              ? [
                  {
                    key: 'chat',
                    title: 'AI Chat',
                    content: <EssayEditorAIChat toolId={generalChatTool.id} />,
                  },
                ]
              : []),
          ]}
        />
      </ResizableSidebar>

      <EssayEditorSubmitModal
        onChangeGoals={onChangeGoals}
        open={submitModalOpen}
        saveSubmissionContent={saveSubmissionContent}
        setOpen={setSubmitModalOpen}
      />
    </div>
  );
}

export default AssignmentEssayEditorMain;
