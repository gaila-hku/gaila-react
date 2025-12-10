import React from 'react';

import { PieChartIcon } from 'lucide-react';

import Card from 'components/display/Card';
import Tabs from 'components/navigation/Tabs';

import DashboardAgentUsage from 'containers/common/Dashboard/DashboardAgentUsage';
import DashboardPromptChart from 'containers/common/Dashboard/DashboardPromptChart';
import PromptHistory from 'containers/teacher/SubmissionDetails/SubmissionDetailsAnalytics/PromptHistory';

import type { AssignmentAnalytics } from 'types/assignment';

type Props = {
  analytics: AssignmentAnalytics;
};

const SubmissionDetailsAnalytics = ({ analytics }: Props) => {
  return (
    <Card
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
            key: 'time',
            title: 'Agent Usage',
            content: <DashboardAgentUsage promptData={analytics.prompt_data} />,
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
            // FIXME: add prompt history
            content: <PromptHistory />,
          },
        ]}
      />
    </Card>
  );
};

export default SubmissionDetailsAnalytics;
