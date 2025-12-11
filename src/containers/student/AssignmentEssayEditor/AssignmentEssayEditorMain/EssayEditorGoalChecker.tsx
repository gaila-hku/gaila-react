import React, { useCallback } from 'react';

import { startCase } from 'lodash-es';
import { CheckCircle, Circle } from 'lucide-react';

import Badge from 'components/display/Badge';
import Clickable from 'components/input/Clickable';

import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import GOAL_SECTIONS from 'containers/student/AssignmentGoalEditor/goalSections';

import type { AssignmentGoalContent } from 'types/assignment';

type Props = {
  onChangeGoals: (goals: AssignmentGoalContent | null) => void;
};

const EssayEditorGoalChecker = ({ onChangeGoals }: Props) => {
  const { goalContent: goals, readonly } = useAssignmentEssayEditorProvider();

  const handleGoalToggle = useCallback(
    async (
      category: 'writing_goals' | 'ai_goals',
      goalIndex: number,
      strategyIndex: number,
    ) => {
      if (!goals) {
        return;
      }

      const newGoals = {
        ...goals,
        [category]: goals[category].map((g, i) => {
          if (i === goalIndex) {
            return {
              ...g,
              strategies: g.strategies.map((s, j) => {
                if (j === strategyIndex) {
                  return {
                    ...s,
                    completed: !s.completed,
                  };
                }
                return s;
              }),
            };
          }
          return g;
        }),
      };
      onChangeGoals(newGoals);
    },
    [goals, onChangeGoals],
  );

  if (!goals) {
    return <></>;
  }

  return (
    <>
      {GOAL_SECTIONS.map(section => (
        <div key={section.categoryKey}>
          <Badge className="mt-1 text-xs" variant="outline">
            {startCase(section.categoryKey)}
          </Badge>
          {goals[section.categoryKey].map((goal, goalIndex) => (
            <div key={`goal-${goalIndex}`}>
              <div className="flex gap-2 items-center ml-2">
                <div className="bg-black w-1 h-1 rounded-full" />
                <p className="text-sm">{goal.goalText}</p>
              </div>
              {goal.strategies.map((strategy, strategyIndex) => (
                <Clickable
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                  disabled={readonly}
                  key={`${section.categoryKey}-${goalIndex}-${strategyIndex}`}
                  onClick={() =>
                    handleGoalToggle(
                      section.categoryKey,
                      goalIndex,
                      strategyIndex,
                    )
                  }
                >
                  {strategy.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm ${strategy.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                    >
                      {strategy.text}
                    </p>
                  </div>
                </Clickable>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default EssayEditorGoalChecker;
