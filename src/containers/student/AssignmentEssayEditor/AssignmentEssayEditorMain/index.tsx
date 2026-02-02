import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import clsx from 'clsx';
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
import EssayEditorOutlineEditButton from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorOutlineEditButton';
import EssayEditorOverview from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorOverview';
import EssayEditorSubmitModal from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorSubmitModal';
import EssayEditorTools from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentGoalContent,
  AssignmentWritingContent,
} from 'types/assignment';
import getWordCount from 'utils/helper/getWordCount';

type WordCountStatus = {
  color: string;
  text: string;
};

function AssignmentEssayEditorMain() {
  const {
    assignment,
    teacherGrade,
    assignmentProgress,
    currentStage,
    saveSubmission,
    isSaving,
    outliningEnabled,
    revisingEnabled,
  } = useAssignmentSubmissionProvider();
  const {
    title,
    outline,
    setOutline,
    essay,
    setEssay,
    outlineConfirmed,
    setOutlineConfirmed,
    setDraftConfirmed,
    setGoalContent,
    nextStageType,
    readonly,
    readonlyMessage,
    essayInit,
  } = useAssignmentEssayEditorProvider();

  const { alertMsg } = useAlert();

  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === currentStage.stage_type + '_general' && tool.enabled,
  );

  const [wordCountStatus, setWordCountStatus] = useState<WordCountStatus>({
    color: '',
    text: '',
  });
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

  const initWordStatus = useRef(false);
  useEffect(() => {
    if (initWordStatus.current || !essayInit) {
      return;
    }
    updateWordCountStatus(essay);
    initWordStatus.current = true;
  }, [updateWordCountStatus, essay, essayInit]);

  const saveSubmissionContent = useCallback(
    (
      newContent: Partial<AssignmentWritingContent>,
      isFinal: boolean,
      alertMsg?: string,
    ) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }

      const content = defaultsDeep(
        newContent,
        currentStage.stage_type === 'outlining'
          ? { outline: outline }
          : {
              title: title,
              essay: essay,
            },
      );

      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: content,
        is_final: isFinal || currentStage.submission?.is_final || false,
        changeStage: isFinal,
        alertMsg,
      });
    },
    [assignmentProgress, currentStage, essay, outline, saveSubmission, title],
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
        is_final: goalStage?.submission?.is_final || false,
        refetchProgress: true,
        changeStage: false,
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
      {},
      true,
      nextStageType === 'drafting'
        ? 'You have saved your outline. You can now draft your essay.'
        : '',
    );
  }, [
    assignmentProgress,
    currentStage,
    nextStageType,
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
      {},
      true,
      nextStageType === 'revising'
        ? 'You are now at the revision stage. Use various tools to aid your revision.'
        : '',
    );
  }, [
    assignmentProgress,
    checkWordCountAndAlert,
    currentStage,
    nextStageType,
    saveSubmissionContent,
    setDraftConfirmed,
  ]);

  const handleFinalSave = useCallback(() => {
    if (!checkWordCountAndAlert()) {
      return;
    }
    const isGoalSettingEnabled = assignmentProgress?.stages.some(
      stage => stage.enabled && stage.stage_type === 'goal_setting',
    );
    if (isGoalSettingEnabled) {
      setSubmitModalOpen(true);
    } else {
      saveSubmissionContent({}, true);
    }
  }, [
    assignmentProgress?.stages,
    checkWordCountAndAlert,
    saveSubmissionContent,
  ]);

  const bottomButton = useMemo(() => {
    const props = {
      className: 'w-full gap-2',
      disabled: readonly || isSaving,
      size: 'lg' as const,
    };
    if (currentStage?.stage_type === 'outlining') {
      if (nextStageType === 'drafting') {
        return (
          <Button onClick={handleConfirmOutline} {...props}>
            <CheckCircle className="h-4 w-4" />
            Lock Outline & Start Drafting
          </Button>
        );
      }
      return (
        <Button onClick={handleConfirmOutline} {...props}>
          <CheckCircle className="h-4 w-4" />
          Next Stage
        </Button>
      );
    }
    if (currentStage?.stage_type === 'drafting') {
      if (nextStageType === 'revising') {
        return (
          <Button onClick={handleConfirmDraft} {...props}>
            <CheckCircle className="h-4 w-4" />
            Confirm Draft & Start Revising
          </Button>
        );
      }
      return (
        <Button
          onClick={revisingEnabled ? handleConfirmDraft : handleFinalSave}
          {...props}
        >
          <CheckCircle className="h-4 w-4" />
          Submit Essay
        </Button>
      );
    }
    if (currentStage?.stage_type === 'revising') {
      return (
        <Button onClick={handleFinalSave} {...props}>
          <CheckCircle className="h-4 w-4" />
          Finish Revising & Submit Essay
        </Button>
      );
    }
  }, [
    currentStage?.stage_type,
    handleConfirmDraft,
    handleConfirmOutline,
    handleFinalSave,
    isSaving,
    nextStageType,
    readonly,
    revisingEnabled,
  ]);

  if (!assignmentProgress || !currentStage || !assignment) {
    return <></>;
  }

  return (
    <div className="space-y-6">
      {/* Graded Status Alert */}
      {readonly && (
        <Card
          classes={{
            root: readonlyMessage?.bgClass,
            title: clsx(
              'flex items-center gap-2 text-base',
              readonlyMessage?.textClass,
            ),
          }}
          title={
            <>
              {readonlyMessage?.icon}
              {readonlyMessage?.title}
            </>
          }
        >
          <p className={clsx('text-sm', readonlyMessage?.textClass)}>
            {readonlyMessage?.longMessage}
          </p>
        </Card>
      )}

      <ResizableSidebar>
        {/* Main Editor */}
        <div className="space-y-6">
          {/* <EssayEditorStageStepper /> */}

          {/* Header with save buttons */}
          <EssayEditorHeader
            saveSubmissionContent={saveSubmissionContent}
            wordCountStatus={wordCountStatus}
          />

          {/* Outline editor */}
          {currentStage.stage_type === 'outlining' ? (
            <Card
              classes={{
                description: '-mt-2 mb-2',
              }}
              description="Create a structured outline for your essay. This will help guide your writing in the next stage."
              title="Outline Your Essay"
            >
              {readonly ? (
                <div className={clsx('text-xs', readonlyMessage?.textClass)}>
                  {readonlyMessage?.shortMessage}
                </div>
              ) : null}
              <EssayEditorInput
                disabled={outlineConfirmed}
                handleAutoSave={handleAutoSave}
                minHeight={outlineConfirmed ? 0 : 400}
                onChange={setOutline}
                value={outline}
              />
              {outlineConfirmed && <EssayEditorOutlineEditButton />}
            </Card>
          ) : (
            <>
              {outlineConfirmed && (
                <Card title="Outline">
                  <EssayEditorInput
                    disabled
                    onChange={setOutline}
                    value={outline}
                  />
                  <EssayEditorOutlineEditButton />
                </Card>
              )}
              <Card title="Essay Content">
                {readonly ? (
                  <div className={clsx('text-xs', readonlyMessage?.textClass)}>
                    {readonlyMessage?.shortMessage}
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
            </>
          )}

          {bottomButton}
        </div>

        {/* Sidebar with Tabs */}
        <Tabs
          className={clsx([
            'sticky bottom-0',
            outliningEnabled || revisingEnabled ? 'top-[137px]' : 'top-[80px]',
          ])}
          classes={{
            panel: clsx([
              'overflow-auto',
              outliningEnabled || revisingEnabled
                ? 'h-[calc(100vh-210px)]'
                : 'h-[calc(100vh-152px)]',
            ]),
          }}
          tabs={[
            {
              key: 'overview',
              title: teacherGrade ? 'Grade' : 'Self Assessment',
              content: (
                <EssayEditorOverview
                  assignment={assignment}
                  grade={teacherGrade}
                  onChangeGoals={onChangeGoals}
                />
              ),
            },
            ...(currentStage.tools.some(
              tool => tool.id !== generalChatTool?.id && tool.enabled,
            )
              ? [
                  {
                    key: 'tools',
                    title: 'AI Assessment',
                    content: <EssayEditorTools />,
                  },
                ]
              : []),
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
