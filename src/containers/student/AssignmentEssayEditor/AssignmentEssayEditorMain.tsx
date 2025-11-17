import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { ArrowRight, CheckCircle, FileText, Save } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';
import Tabs from 'components/navigation/Tabs';

import useAlert from 'containers/common/AlertProvider/useAlert';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import EssayEditorAIChat from 'containers/student/AssignmentEssayEditor/EssayEditorAIChat';
import EssayEditorInput from 'containers/student/AssignmentEssayEditor/EssayEditorInput';
import EssayEditorOverview from 'containers/student/AssignmentEssayEditor/EssayEditorOverview';
import EssayEditorTools from 'containers/student/AssignmentEssayEditor/EssayEditorTools';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import {
  apiSaveAssignmentSubmission,
  apiViewAssignmentProgress,
} from 'api/assignment';
import type { AssignmentEssayContent, AssignmentGoal } from 'types/assignment';

type WordCountStatus = {
  color: string;
  text: string;
};

function AssignmentEssayEditorMain() {
  const { assignmentProgress, currentStage } =
    useAssignmentSubmissionProvider();

  const queryClient = useQueryClient();
  const { alertMsg, successMsg, errorMsg } = useAlert();

  const { mutate: saveSubmission } = useMutation(apiSaveAssignmentSubmission, {
    onSuccess: async (res, req) => {
      if (res.is_final) {
        await queryClient.invalidateQueries([
          apiViewAssignmentProgress.queryKey,
        ]);
        return;
      }
      if (req.is_manual) {
        successMsg('Essay draft saved.');
      }
    },
    onError: errorMsg,
  });

  const [assignment, teacherGrade, isGraded] = useMemo(() => {
    if (!assignmentProgress || !currentStage) {
      return [null, null, false];
    }
    const grade = currentStage.grade;
    return [assignmentProgress.assignment, grade, !!grade];
  }, [assignmentProgress, currentStage]);

  const readonly = isGraded || assignmentProgress?.is_finished || false;
  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === 'writing_general',
  );

  const [title, setTitle] = useState('');
  const essayContent = useRef('');
  const [wordCountStatus, setWordCountStatus] = useState<WordCountStatus>({
    color: '',
    text: '',
  });
  const [goals, setGoals] = useState<AssignmentGoal[]>([]);

  const getEssayContent = useCallback(() => {
    return essayContent.current;
  }, []);

  const getWordCountStatus = useCallback(
    (essayContent: string) => {
      const wordCount = essayContent
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;

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
    ],
  );

  const updateWordCountStatus = useCallback(() => {
    setWordCountStatus(getWordCountStatus(essayContent.current));
  }, [essayContent, getWordCountStatus]);

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
      setWordCountStatus(getWordCountStatus(''));
      return;
    }

    try {
      const submissionContent = submission.content as AssignmentEssayContent;
      setTitle(submissionContent.title || '');
      essayContent.current = submissionContent.content || '';
      setWordCountStatus(getWordCountStatus(submissionContent.content || ''));
      setGoals(submissionContent.goals || []);
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
        // Check word count
        if (
          assignment?.requirements?.min_word_count &&
          essayContent.current.split(/\s+/).length <
            assignment.requirements.min_word_count
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
          essayContent.current.split(/\s+/).length >
            assignment.requirements.max_word_count
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
        content: JSON.stringify({
          title: title,
          content: essayContent.current,
          goals,
        }),
        is_final: isFinal,
        is_manual: isManual,
      });
    },
    [
      alertMsg,
      assignment,
      assignmentProgress,
      currentStage,
      goals,
      saveSubmission,
      title,
    ],
  );

  const onChangeGoals = useCallback(
    (newGoals: AssignmentGoal[]) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }

      setGoals(newGoals);
      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: JSON.stringify({
          title: title,
          content: essayContent.current,
          goals: newGoals,
        }),
        is_final: false,
        is_manual: false,
      });
    },
    [assignmentProgress, currentStage, saveSubmission, title],
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
              Essay Graded
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
          <Card
            action={
              <div className="flex gap-2">
                <Button
                  className="gap-2 w-full sm:w-auto"
                  disabled={readonly}
                  onClick={() => handleSave(false, true)}
                  variant="secondary"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  className="gap-2 w-full sm:w-auto"
                  disabled={readonly}
                  onClick={() => handleSave(true, true)}
                >
                  Submit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            }
            classes={{
              title: 'flex gap-4 mb-0',
            }}
            description={assignment.description}
            title={
              <>
                <FileText className="h-5 w-5" />
                {assignment.title}
              </>
            }
          >
            <TextInput
              className="text-base sm:text-lg font-semibold !mb-4"
              disabled={readonly}
              label="Essay Title"
              onBlur={() => handleSave(false, false)}
              onChange={e => setTitle(e.target.value)}
              value={title}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
              essayContent={essayContent}
              handleSave={handleSave}
              isGraded={readonly}
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
                  goals={goals}
                  grade={teacherGrade}
                  onChangeGoals={onChangeGoals}
                  readonly={readonly}
                />
              ),
            },
            {
              key: 'tools',
              title: 'Tools',
              content: (
                <EssayEditorTools
                  getEssayContent={getEssayContent}
                  tools={currentStage.tools}
                />
              ),
            },
            ...(generalChatTool
              ? [
                  {
                    key: 'chat',
                    title: 'AI Chat',
                    content: (
                      <EssayEditorAIChat
                        getEssayContent={getEssayContent}
                        toolId={generalChatTool.id}
                      />
                    ),
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
