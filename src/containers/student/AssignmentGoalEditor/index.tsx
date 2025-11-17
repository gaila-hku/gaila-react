import React, { useCallback, useEffect, useState } from 'react';

import { ArrowRight, Lightbulb, Plus, Save, Target, X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import AIChatBox from 'containers/common/AIChatBox.tsx';
import useAlert from 'containers/common/AlertProvider/useAlert';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import GOAL_QUESTIONS from 'containers/student/AssignmentGoalEditor/goalQuestions';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import {
  apiSaveAssignmentSubmission,
  apiViewAssignmentProgress,
} from 'api/assignment';
import type { AssignmentGoal } from 'types/assignment';
import isObjEmpty from 'utils/helper/isObjEmpty';

const defaultResponses = GOAL_QUESTIONS.reduce(
  (acc, q) => ({ ...acc, [q.category]: [''] }),
  {},
);

const AssignmentGoalEditor = () => {
  const { assignmentProgress, currentStage } =
    useAssignmentSubmissionProvider();

  const queryClient = useQueryClient();
  const { alertMsg, successMsg, errorMsg } = useAlert();

  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === 'goal_general',
  );

  const { mutate: saveSubmission } = useMutation(apiSaveAssignmentSubmission, {
    onSuccess: async (res, req) => {
      if (res.is_final) {
        await queryClient.invalidateQueries([
          apiViewAssignmentProgress.queryKey,
        ]);
        return;
      }
      if (req.is_manual) {
        successMsg('Goals draft saved.');
      }
    },
    onError: errorMsg,
  });

  const [responses, setResponses] = useState<{ [category: string]: string[] }>(
    defaultResponses,
  );

  const handleAddGoal = useCallback((category: string) => {
    setResponses(prev => ({
      ...prev,
      [category]: (prev[category] || []).concat(''),
    }));
  }, []);

  const handleRemoveGoal = useCallback((category: string, index: number) => {
    setResponses(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  }, []);

  const handleChangeText = useCallback(
    (category: string, index: number, value: string) => {
      setResponses(prev => ({
        ...prev,
        [category]: prev[category].map((s, i) => (i === index ? value : s)),
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (isFinal: boolean, isManual: boolean) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }
      const goals: AssignmentGoal[] = GOAL_QUESTIONS.filter(
        q => !isObjEmpty(responses[q.category]),
      ).map(q => ({
        category: q.category,
        goals: responses[q.category].filter(Boolean).map(goal => ({
          text: goal,
        })),
      }));

      if (isFinal && goals.length === 0) {
        alertMsg('Please answer at least one question to set your goals.');
        return;
      }

      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: JSON.stringify(goals),
        is_final: isFinal,
        is_manual: isManual,
      });
    },
    [alertMsg, assignmentProgress, currentStage, responses, saveSubmission],
  );

  useEffect(() => {
    if (currentStage?.submission?.content) {
      const goals = currentStage.submission.content as AssignmentGoal[];
      setResponses({
        ...defaultResponses,
        ...goals.reduce(
          (acc, goal) => ({
            ...acc,
            [goal.category]: goal.goals.map(g => g.text),
          }),
          {},
        ),
      });
    }
  }, [currentStage]);

  if (!assignmentProgress || !currentStage) {
    return <></>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          Set Your Writing Goals
        </h1>
        <p className="text-muted-foreground">
          Before you start writing {assignmentProgress.assignment.title},
          let&apos;s set some goals to guide your writing process and help you
          stay focused.
        </p>
      </div>

      <ResizableSidebar>
        {/* Main Content */}
        <div className="space-y-6">
          <Card
            classes={{
              children: 'space-y-6',
              title: 'flex items-center gap-2 -mb-2',
              header: 'mb-4',
            }}
            description="Answer the questions below to define your goals. These will appear as a checklist while you write."
            title={
              <>
                <Lightbulb className="h-5 w-5" />
                Goal Setting Questions
              </>
            }
          >
            {GOAL_QUESTIONS.map((question, questionIndex) => (
              <div className="space-y-2" key={question.category}>
                <div className="flex items-center justify-between">
                  <label className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex-shrink-0 mt-0.5">
                      {questionIndex + 1}
                    </span>
                    <span>{question.question}</span>
                  </label>
                  <Button
                    className="gap-2"
                    onClick={() => handleAddGoal(question.category)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    Add Goal
                  </Button>
                </div>
                <div className="space-y-4">
                  {responses[question.category].map((s, goalIndex) => (
                    <div
                      className="flex gap-2 items-start"
                      key={`${question.category}-${goalIndex}`}
                    >
                      <TextInput
                        className="resize-none"
                        onBlur={() => handleSubmit(false, false)}
                        onChange={e =>
                          handleChangeText(
                            question.category,
                            goalIndex,
                            e.target.value,
                          )
                        }
                        placeholder={
                          goalIndex === 0 ? question.placeholder : ''
                        }
                        rows={3}
                        value={s}
                      />
                      <Button
                        disabled={responses[question.category].length === 1}
                        onClick={() =>
                          handleRemoveGoal(question.category, goalIndex)
                        }
                        size="icon"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              className="gap-2"
              onClick={() => handleSubmit(false, true)}
              size="lg"
              variant="secondary"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              className="gap-2"
              onClick={() => handleSubmit(true, true)}
              size="lg"
            >
              Submit and Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!!generalChatTool && (
          <div className="h-fit sticky top-[80px]">
            <AIChatBox
              chatName="Goal Setting Assistant"
              description="Ask me anything about setting effective writing goals"
              firstMessage="Hi! I'm here to help you set effective writing goals. Feel free to ask me questions about setting goals, writing strategies, or how to use AI tools effectively in your essay writing process."
              placeholder="Ask about goal setting strategies..."
              toolId={generalChatTool.id}
            />
          </div>
        )}
      </ResizableSidebar>
    </>
  );
};

export default AssignmentGoalEditor;
