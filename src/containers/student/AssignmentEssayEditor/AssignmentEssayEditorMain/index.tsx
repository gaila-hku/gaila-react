import React, { useCallback, useEffect, useState } from 'react';

import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ArrowRight, CheckCircle, FileText, Save } from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';
import Tabs from 'components/navigation/Tabs';

import useAlert from 'containers/common/AlertProvider/useAlert';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import EssayEditorAIChat from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorAIChat';
import EssayEditorInput from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorInput';
import EssayEditorOverview from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorOverview';
import EssayEditorTools from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentEssayContent,
  AssignmentGoalContent,
} from 'types/assignment';

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
    essayContent,
    getEssayWordCount,
    goalContent,
    setGoalContent,
    readonly,
  } = useAssignmentEssayEditorProvider();

  const { alertMsg } = useAlert();

  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === 'writing_general',
  );

  const [title, setTitle] = useState('');
  const [wordCountStatus, setWordCountStatus] = useState<WordCountStatus>({
    color: '',
    text: '',
  });

  const getWordCountStatus = useCallback(
    (essayContent: string) => {
      const wordCount = getEssayWordCount(essayContent);

      const min = assignment?.requirements?.min_word_count || 0;
      const max = assignment?.requirements?.max_word_count || 0;

      if (!min && !max) {
        return {
          color: 'text-gray-600',
          text: `${wordCount} word${wordCount === 1 ? '' : 's'}`,
        };
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
        return {
          color: 'text-orange-600',
          text: `${wordCountDisplay} (${min - wordCount} more needed)`,
        };
      } else if (!!max && wordCount > max) {
        return {
          color: 'text-red-600',
          text: `${wordCountDisplay} (${wordCount - max} over limit)`,
        };
      } else {
        return {
          color: 'text-green-600',
          text: `${wordCountDisplay} (good!)`,
        };
      }
    },
    [
      assignment?.requirements?.max_word_count,
      assignment?.requirements?.min_word_count,
      getEssayWordCount,
    ],
  );

  const updateWordCountStatus = useCallback(() => {
    setWordCountStatus(getWordCountStatus(essayContent.current.essay));
  }, [essayContent, getWordCountStatus]);

  useEffect(() => {
    if (!assignmentProgress || !currentStage) {
      return;
    }

    const submission = currentStage.submission;

    if (!submission) {
      setWordCountStatus(getWordCountStatus(''));
      return;
    }

    try {
      const submissionContent = submission.content as AssignmentEssayContent;
      setTitle(submissionContent.title || '');
      setWordCountStatus(getWordCountStatus(submissionContent.essay || ''));
    } catch (e) {
      console.error(e);
    }
  }, [assignmentProgress, currentStage, getWordCountStatus]);

  const handleSave = useCallback(
    (isFinal: boolean, isManual: boolean) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }

      if (isFinal) {
        const wordCount = getEssayWordCount(essayContent.current.essay);
        if (
          assignment?.requirements?.min_word_count &&
          wordCount < assignment.requirements.min_word_count
        ) {
          alertMsg(
            'Please write at least ' +
              assignment.requirements.min_word_count +
              ' words.',
          );
          return;
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
          return;
        }
      }

      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: {
          title: title,
          outline: essayContent.current.outline,
          essay: essayContent.current.essay,
          goals: goalContent,
        },
        is_final: isFinal,
        is_manual: isManual,
      });
    },
    [
      alertMsg,
      assignment?.requirements,
      assignmentProgress,
      currentStage,
      essayContent,
      getEssayWordCount,
      goalContent,
      saveSubmission,
      title,
    ],
  );

  const onChangeGoals = useCallback(
    (newGoals: AssignmentGoalContent | null) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }

      setGoalContent(newGoals);
      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: {
          title: title,
          outline: essayContent.current.outline,
          essay: essayContent.current.essay,
          goals: newGoals,
        },
        is_final: false,
        is_manual: false,
      });
    },
    [
      assignmentProgress,
      currentStage,
      essayContent,
      saveSubmission,
      setGoalContent,
      title,
    ],
  );

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
          <div className="w-full py-4 px-4 bg-secondary/30 rounded-lg border">
            <Stepper activeStep={0} alternativeLabel className="basis-[400px]">
              <Step>
                <StepLabel>
                  <div className="-mt-2">Outline</div>
                  <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
                    Plan your essay structure
                  </div>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <div className="-mt-2">Drafting</div>
                  <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
                    Write your first draft
                  </div>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <div className="-mt-2">Revising</div>
                  <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
                    Refine and polish
                  </div>
                </StepLabel>
              </Step>
            </Stepper>
          </div>

          <Card
            action={
              <div className="flex gap-2">
                <Button
                  className="gap-2 w-full sm:w-auto"
                  disabled={readonly || isSaving}
                  onClick={() => handleSave(false, true)}
                  variant="secondary"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  className="gap-2 w-full sm:w-auto"
                  disabled={readonly || isSaving}
                  onClick={() => handleSave(true, true)}
                >
                  Submit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            }
            title={
              <>
                <div className="flex gap-4 mb-2">
                  <FileText className="h-5 w-5" />
                  {assignment.title}
                </div>
                <div className="font-normal text-base text-muted-foreground">
                  {assignment.description}
                </div>
              </>
            }
          >
            {!!assignment.requirements?.title && (
              <TextInput
                className="text-base sm:text-lg font-semibold"
                disabled={readonly}
                label="Essay Title"
                onBlur={() => handleSave(false, false)}
                onChange={e => setTitle(e.target.value)}
                value={title}
              />
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-4">
              <Badge
                className={`px-2 py-1 text-xs sm:text-sm ${wordCountStatus.color}`}
                variant="outline"
              >
                {wordCountStatus.text}
              </Badge>

              {!!assignment.due_date && (
                <Badge
                  className="px-2 py-1 text-xs sm:text-sm"
                  variant="outline"
                >
                  Due: {dayjs(assignment.due_date).format('MMM D, YYYY')}
                </Badge>
              )}
            </div>
          </Card>

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
              handleSave={handleSave}
              type="outline"
              updateWordCountStatus={updateWordCountStatus}
            />
          </Card>

          <Card
            classes={{
              description: clsx(
                'text-xs',
                teacherGrade ? '!text-purple-600' : '!text-green-600',
              ),
            }}
            description={
              teacherGrade
                ? 'This essay has been graded and can no longer be edited.'
                : readonly
                  ? 'You have submitted your essay.'
                  : null
            }
            title="Essay Content"
          >
            <EssayEditorInput
              handleSave={handleSave}
              type="essay"
              updateWordCountStatus={updateWordCountStatus}
            />
          </Card>
        </div>

        {/* Sidebar with Tabs */}
        <Tabs
          tabs={[
            {
              key: 'overview',
              title: readonly ? 'Grade' : 'Overview',
              content: (
                <EssayEditorOverview
                  assignment={assignment}
                  goals={goalContent}
                  grade={teacherGrade}
                  onChangeGoals={onChangeGoals}
                  readonly={readonly}
                />
              ),
            },
            {
              key: 'tools',
              title: 'Tools',
              content: <EssayEditorTools tools={currentStage.tools} />,
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
    </div>
  );
}

export default AssignmentEssayEditorMain;
