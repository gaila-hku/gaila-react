import React, { useCallback } from 'react';

import clsx from 'clsx';
import { startCase } from 'lodash-es';
import { CheckCircle, Circle } from 'lucide-react';

import Badge from 'components/display/Badge';
import Clickable from 'components/input/Clickable';

import GOAL_SECTIONS from 'containers/student/AssignmentGoalEditor/goalSections';

import type { AssignmentGoalContent } from 'types/assignment';

type Props = {
  goals: AssignmentGoalContent | null;
  onChangeGoals?: (goals: AssignmentGoalContent) => void;
  readonly?: boolean;
};

const AssignmentGoalChecker = ({ goals, onChangeGoals, readonly }: Props) => {
  const handleGoalToggle = useCallback(
    (
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
      onChangeGoals?.(newGoals);
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
              <div className="flex gap-2 items-start ml-2">
                <div className="bg-black w-1 h-1 rounded-full  relative top-2" />
                <p className="text-sm">{goal.goalText}</p>
              </div>
              {goal.strategies.map((strategy, strategyIndex) => (
                <Clickable
                  className={clsx(
                    'flex items-center gap-2 p-2 rounded transition-colors',
                    readonly ? '' : 'hover:bg-muted/50 ',
                  )}
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

export default AssignmentGoalChecker;
