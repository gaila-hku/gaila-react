import React from 'react';

import { Info } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { PromptAnalytics } from 'types/assignment';

type Props = {
  promptData: PromptAnalytics;
};

const DashboardAgentUsage = ({ promptData }: Props) => {
  // FIXME: demo data
  const usageData = [
    {
      stageType: 'Ideation',
      'Agent uses': '2',
      'Follow-up prompts': '6',
      color: '#3b82f6',
    },
    {
      stageType: 'Dictionary',
      'Agent uses': '4',
      'Follow-up prompts': '1',
      color: '#3b82f6',
    },
    {
      stageType: 'Auto-grading',
      'Agent uses': '0',
      'Follow-up prompts': '0',
      color: '#3b82f6',
    },
    {
      stageType: 'Revision',
      'Agent uses': '1',
      'Follow-up prompts': '2',
      color: '#3b82f6',
    },
  ];

  return (
    <>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Writing Stage Timeline</h4>
        <ResponsiveContainer height={200} width="100%">
          <BarChart
            data={usageData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stageType" type="category" width={80} />
            <RechartsTooltip formatter={value => `${value} min(s)`} />
            <Bar dataKey="Agent uses" fill="#3b82f6" stackId="a" />
            <Bar
              dataKey="Follow-up prompts"
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
              stackId="a"
            />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2 pt-4 text-muted-foreground items-center">
        <Info className="h-4 w-4" />
        <p className="text-sm">
          Utilize follow-up prompts you don&apos;t understand AI&apos;s output
        </p>
      </div>
    </>
  );
};

export default DashboardAgentUsage;
