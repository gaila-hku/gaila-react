import React, { useMemo } from 'react';

import { Target } from 'lucide-react';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import LinearProgress from 'components/display/Progress/LinearProgress';

import AssignmentGoalChecker from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/AssignmentGoalChecker';

import type {
  AssignmentGoalContent,
  AssignmentProgress,
} from 'types/assignment';
import getGoalCounts from 'utils/helper/getGoalCounts';

type Props = {
  assignmentProgress: AssignmentProgress;
};

const AssignmentReflectionGoals = ({ assignmentProgress }: Props) => {
  const goalContent = useMemo(() => {
    const goalSettingStage = assignmentProgress.stages.find(
      stage => stage.stage_type === 'goal_setting',
    );
    if (!goalSettingStage?.submission) {
      return null;
    }
    const content = goalSettingStage.submission
      .content as AssignmentGoalContent;
    return content;
  }, [assignmentProgress.stages]);

  const [completeGoalCount, totalGoalCount] = useMemo(
    () => getGoalCounts(goalContent),
    [goalContent],
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

      <AssignmentGoalChecker goals={goalContent} readonly />
    </Card>
  );
};

export default AssignmentReflectionGoals;
