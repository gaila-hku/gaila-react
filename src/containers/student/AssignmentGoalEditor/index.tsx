import React, { useCallback, useEffect, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  Plus,
  Save,
  Target,
  X,
} from 'lucide-react';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import AIChatBox from 'containers/common/AIChatBox';
import useAlert from 'containers/common/AlertProvider/useAlert';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import GOAL_SECTIONS from 'containers/student/AssignmentGoalEditor/goalSections';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentGoal, AssignmentGoalContent } from 'types/assignment';

const defaultGoals = {
  writing_goals: [
    { goalText: '', strategies: [{ text: '' }] },
  ] as AssignmentGoal[],
  ai_goals: [{ goalText: '', strategies: [{ text: '' }] }] as AssignmentGoal[],
  goal_confirmed: false,
};

const AssignmentGoalEditor = () => {
  const {
    assignmentProgress,
    currentStage,
    saveSubmission,
    isSaving,
    readonly,
  } = useAssignmentSubmissionProvider();

  const { alertMsg } = useAlert();

  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === 'goal_general',
  );

  const [goalValue, setGoalValue] = useState(defaultGoals);

  const handleAddGoal = useCallback(
    (category: 'writing_goals' | 'ai_goals') => {
      setGoalValue(prev => ({
        ...prev,
        [category]: [
          ...prev[category],
          { goalText: '', strategies: [{ text: '' }] },
        ],
      }));
    },
    [],
  );

  const handleRemoveGoal = useCallback(
    (category: 'writing_goals' | 'ai_goals', index: number) => {
      if (goalValue[category].length <= 1) {
        return;
      }
      setGoalValue({
        ...goalValue,
        [category]: goalValue[category].filter((_, i) => i !== index),
      });
    },
    [goalValue],
  );

  const handleChangeGoalText = useCallback(
    (category: 'writing_goals' | 'ai_goals', index: number, value: string) => {
      setGoalValue(prev => ({
        ...prev,
        [category]: prev[category].map((g, i) =>
          i === index ? { ...g, goalText: value } : g,
        ),
      }));
    },
    [],
  );

  const handleAddStrategy = useCallback(
    (category: 'writing_goals' | 'ai_goals', goalIndex: number) => {
      setGoalValue(prev => ({
        ...prev,
        [category]: prev[category].map((g, i) =>
          i === goalIndex
            ? { ...g, strategies: [...g.strategies, { text: '' }] }
            : g,
        ),
      }));
    },
    [],
  );

  const handleRemoveStrategy = useCallback(
    (
      category: 'writing_goals' | 'ai_goals',
      goalIndex: number,
      strategyIndex: number,
    ) => {
      if (goalValue[category][goalIndex].strategies.length <= 1) {
        return;
      }
      setGoalValue({
        ...goalValue,
        [category]: goalValue[category].map((g, i) =>
          i === goalIndex
            ? {
                ...g,
                strategies: g.strategies.filter((_, j) => j !== strategyIndex),
              }
            : g,
        ),
      });
    },
    [goalValue],
  );

  const handleChangeStrategyText = useCallback(
    (
      category: 'writing_goals' | 'ai_goals',
      goalIndex: number,
      strategyIndex: number,
      value: string,
    ) => {
      setGoalValue(prev => ({
        ...prev,
        [category]: prev[category].map((g, i) =>
          i === goalIndex
            ? {
                ...g,
                strategies: g.strategies.map((s, j) =>
                  j === strategyIndex ? { ...s, text: value } : s,
                ),
              }
            : g,
        ),
      }));
    },
    [],
  );

  const handleConfirmGoals = useCallback(() => {
    if (!assignmentProgress || !currentStage || readonly) {
      return;
    }

    const isGoalsEmpty = [
      ...goalValue.writing_goals,
      ...goalValue.ai_goals,
    ].every(goal => !goal.goalText.trim());
    if (isGoalsEmpty) {
      alertMsg('Please set at least one goal for this assignment.');
      return;
    }

    const newGoalValue = {
      writing_goals: goalValue.writing_goals
        .filter(goal => goal.goalText.trim())
        .map(goal => ({
          ...goal,
          strategies: [{ text: '' }],
        })),
      ai_goals: goalValue.ai_goals
        .filter(goal => goal.goalText.trim())
        .map(goal => ({
          ...goal,
          strategies: [{ text: '' }],
        })),
      goal_confirmed: true,
    };
    setGoalValue(newGoalValue);

    saveSubmission({
      assignment_id: assignmentProgress.assignment.id,
      stage_id: currentStage.id,
      content: newGoalValue,
      is_final: false,
      alertMsg:
        'Good job on setting your goals! Now, think about your strategies for each goal.',
    });
  }, [
    alertMsg,
    assignmentProgress,
    currentStage,
    goalValue,
    readonly,
    saveSubmission,
  ]);

  const handleCancelGoals = useCallback(() => {
    if (!assignmentProgress || !currentStage || readonly) {
      return;
    }
    const newGoalValue = {
      ...goalValue,
      isGoalConfirmed: false,
    };
    setGoalValue(newGoalValue);

    saveSubmission({
      assignment_id: assignmentProgress.assignment.id,
      stage_id: currentStage.id,
      content: newGoalValue,
      is_final: false,
    });
  }, [assignmentProgress, currentStage, goalValue, readonly, saveSubmission]);

  const handleSubmit = useCallback(
    (isFinal: boolean, isManual?: boolean) => {
      if (!assignmentProgress || !currentStage || readonly) {
        return;
      }

      const isGoalsEmpty = [
        ...goalValue.writing_goals,
        ...goalValue.ai_goals,
      ].every(goal => !goal.goalText.trim());
      const isStrategiesEmpty = [
        ...goalValue.writing_goals,
        ...goalValue.ai_goals,
      ].some(goal => goal.strategies.every(strategy => !strategy.text.trim()));

      if (isFinal && isGoalsEmpty) {
        alertMsg('Please set at least one goal for this assignment.');
        return;
      }
      if (isFinal && isStrategiesEmpty) {
        alertMsg('Please set at least one strategy for each goal.');
        return;
      }

      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: goalValue,
        is_final: isFinal,
        alertMsg: isManual ? 'Goals draft saved.' : undefined,
      });
    },
    [
      alertMsg,
      assignmentProgress,
      currentStage,
      goalValue,
      readonly,
      saveSubmission,
    ],
  );

  useEffect(() => {
    if (!currentStage?.submission?.content) {
      return;
    }
    const goals = currentStage.submission.content as AssignmentGoalContent;
    setGoalValue(goals);
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
            {GOAL_SECTIONS.map((section, categoryIndex) => (
              <div className="space-y-2" key={section.categoryKey}>
                <div className="flex items-center justify-between">
                  <label className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex-shrink-0 mt-0.5">
                      {categoryIndex + 1}
                    </span>
                    <span>{section.question}</span>
                  </label>
                  {!goalValue.goal_confirmed && (
                    <Button
                      className="gap-2"
                      disabled={readonly}
                      onClick={() => handleAddGoal(section.categoryKey)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                      Add Goal
                    </Button>
                  )}
                </div>
                <div className="space-y-4 pl-8">
                  {goalValue[section.categoryKey].map((goal, goalIndex) => (
                    <div key={`${section.categoryKey}-${goalIndex}`}>
                      <div className="flex gap-2 items-start">
                        <TextInput
                          className="resize-none"
                          disabled={readonly || goalValue.goal_confirmed}
                          onBlur={() => handleSubmit(false, false)}
                          onChange={e =>
                            handleChangeGoalText(
                              section.categoryKey,
                              goalIndex,
                              e.target.value,
                            )
                          }
                          placeholder={section.goalPlaceholder}
                          rows={3}
                          value={goal.goalText}
                        />
                        {!goalValue.goal_confirmed && (
                          <Button
                            disabled={readonly}
                            onClick={() =>
                              handleRemoveGoal(section.categoryKey, goalIndex)
                            }
                            size="icon"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {!!goalValue.goal_confirmed && (
                        <div className="mt-2 p-2 border rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <label>
                              What are your strategies to achieve this goal?
                            </label>
                            <Button
                              className="gap-2"
                              disabled={readonly}
                              onClick={() =>
                                handleAddStrategy(
                                  section.categoryKey,
                                  goalIndex,
                                )
                              }
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4" />
                              Add Strategy
                            </Button>
                          </div>
                          {goal.strategies.map((strategy, strategyIndex) => (
                            <div
                              className="flex gap-2 items-start"
                              key={`${section.categoryKey}-${strategyIndex}`}
                            >
                              <TextInput
                                className="resize-none"
                                disabled={readonly}
                                onBlur={() => handleSubmit(false, false)}
                                onChange={e =>
                                  handleChangeStrategyText(
                                    section.categoryKey,
                                    goalIndex,
                                    strategyIndex,
                                    e.target.value,
                                  )
                                }
                                placeholder={
                                  strategyIndex === 0
                                    ? section.strategyPlaceholder
                                    : ''
                                }
                                rows={3}
                                value={strategy.text}
                              />
                              <Button
                                disabled={readonly}
                                onClick={() =>
                                  handleRemoveStrategy(
                                    section.categoryKey,
                                    goalIndex,
                                    strategyIndex,
                                  )
                                }
                                size="icon"
                                variant="ghost"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
              disabled={readonly || isSaving}
              onClick={() => handleSubmit(false, true)}
              size="lg"
              variant="secondary"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            {goalValue.goal_confirmed ? (
              <>
                <Button
                  className="gap-2"
                  disabled={readonly || isSaving}
                  onClick={handleCancelGoals}
                  size="lg"
                  variant="secondary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Goal Setting
                </Button>
                <Button
                  className="gap-2"
                  disabled={readonly || isSaving}
                  onClick={() => handleSubmit(true, true)}
                  size="lg"
                >
                  Submit and Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                className="gap-2"
                disabled={readonly || isSaving}
                onClick={handleConfirmGoals}
                size="lg"
              >
                <Check className="h-4 w-4" />
                Confirm Goals
              </Button>
            )}
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
