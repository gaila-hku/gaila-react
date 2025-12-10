import React, { useMemo } from 'react';

import { CheckCircle, Circle, Target } from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import LinearProgress from 'components/display/Progress/LinearProgress';

import GOAL_SECTIONS from 'containers/student/AssignmentGoalEditor/goalSections';

import type {
  AssignmentEssayContent,
  AssignmentProgress,
} from 'types/assignment';
import getGoalCounts from 'utils/helper/getGoalCounts';

type Props = {
  assignmentProgress: AssignmentProgress;
};

const AssignmentReflectionStatistics = ({ assignmentProgress }: Props) => {
  const goals = useMemo(() => {
    const goalSettingStage = assignmentProgress.stages.find(
      stage => stage.stage_type === 'writing',
    );
    if (!goalSettingStage?.submission) {
      return null;
    }
    const content = goalSettingStage.submission
      .content as AssignmentEssayContent;
    return content.goals;
  }, [assignmentProgress.stages]);

  const [completeGoalCount, totalGoalCount] = useMemo(
    () => getGoalCounts(goals),
    [goals],
  );

  const goalCompletionRate = useMemo(() => {
    if (totalGoalCount === 0) {
      return 0;
    }
    return (completeGoalCount / totalGoalCount) * 100;
  }, [completeGoalCount, totalGoalCount]);

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2',
        children: 'space-y-4',
      }}
      description={`You achieved ${completeGoalCount} out of ${totalGoalCount} goals`}
      title={
        <>
          <Target className="h-5 w-5" />
          Goal Achievement
        </>
      }
    >
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Completion Rate</span>
          <span>{Math.round(goalCompletionRate)}%</span>
        </div>
        <LinearProgress value={goalCompletionRate} variant="determinate" />
      </div>

      <Divider />

      {!!goals && (
        <div className="space-y-3">
          {GOAL_SECTIONS.map(section => (
            <div className="flex items-start gap-2" key={section.categoryKey}>
              <Badge className="mt-1 text-xs" variant="outline">
                {section.categoryKey}
              </Badge>
              {goals[section.categoryKey].map((goal, goalIndex) => (
                <div key={`goal-${goalIndex}`}>
                  <div className="flex gap-2 items-center ml-2">
                    <div className="bg-black w-1 h-1 rounded-full" />
                    <p className="text-sm">{goal.goalText}</p>
                  </div>
                  {goal.strategies.map((strategy, strategyIndex) => (
                    <div
                      className="flex items-start gap-2"
                      key={`${section.categoryKey}-${goalIndex}-${strategyIndex}`}
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
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AssignmentReflectionStatistics;
