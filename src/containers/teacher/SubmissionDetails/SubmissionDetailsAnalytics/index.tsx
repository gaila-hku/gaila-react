import React from 'react';

import { PieChartIcon } from 'lucide-react';

import Card from 'components/display/Card';
import Tabs from 'components/navigation/Tabs';

import PromptCategoryCharts from 'containers/teacher/SubmissionDetails/SubmissionDetailsAnalytics/PromptCategoryCharts';
import PromptHistory from 'containers/teacher/SubmissionDetails/SubmissionDetailsAnalytics/PromptHistory';
import UseTimeCharts from 'containers/teacher/SubmissionDetails/SubmissionDetailsAnalytics/UseTimeCharts';

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
            title: 'Time Distribution',
            content: <UseTimeCharts />,
          },
          {
            key: 'prompts',
            title: 'Prompt Types',
            content: <PromptCategoryCharts />,
          },
          {
            key: 'history',
            title: 'Prompt History',
            content: <PromptHistory />,
          },
        ]}
      />
    </Card>
  );
};

export default SubmissionDetailsAnalytics;
