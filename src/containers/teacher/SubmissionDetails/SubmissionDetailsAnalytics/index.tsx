import React from 'react';

import { PieChartIcon } from 'lucide-react';

import Card from 'components/display/Card';
import Tabs from 'components/navigation/Tabs';

import DashboardAgentUsage from 'containers/common/Dashboard/DashboardAgentUsage';
import DashboardAnalyticsSummary from 'containers/common/Dashboard/DashboardAnalyticsSummary';
import DashboardPromptChart from 'containers/common/Dashboard/DashboardPromptChart';
import PromptHistory from 'containers/teacher/SubmissionDetails/SubmissionDetailsAnalytics/PromptHistory';

import type {
  Assignment,
  AssignmentAnalytics,
  AssignmentGoalContent,
} from 'types/assignment';

type Props = {
  analytics: AssignmentAnalytics;
  assignment: Assignment;
  essay: string;
  goalContent: AssignmentGoalContent;
  studentId: number;
};

const SubmissionDetailsAnalytics = ({
  analytics,
  assignment,
  essay,
  goalContent,
  studentId,
}: Props) => {
  return (
    <Card
      classes={{ description: '-mt-2 mb-2' }}
      description="Tool usage and writing behavior insights"
      title={
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          <div>Student Analytics</div>
        </div>
      }
    >
      <Tabs
        className="w-full"
        tabs={[
          {
            key: 'metrics',
            title: 'Writing Metrics',
            content: (
              <div className="grid grid-cols-2 gap-4">
                <DashboardAnalyticsSummary
                  assignment={assignment}
                  essay={essay}
                  goalContent={goalContent}
                  promptAnalytics={analytics.prompt_data}
                />
              </div>
            ),
          },
          {
            key: 'time',
            title: 'Agent Usage',
            content: <DashboardAgentUsage usageData={analytics.agent_usage} />,
          },
          {
            key: 'prompts',
            title: 'Prompt Types',
            content: (
              <DashboardPromptChart promptData={analytics.prompt_data} />
            ),
          },
          {
            key: 'history',
            title: 'Prompt History',
            content: <PromptHistory studentId={studentId} />,
          },
        ]}
      />
    </Card>
  );
};

export default SubmissionDetailsAnalytics;
