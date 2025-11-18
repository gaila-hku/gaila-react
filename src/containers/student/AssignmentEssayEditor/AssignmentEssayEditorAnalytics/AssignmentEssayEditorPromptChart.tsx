import React, { useMemo } from 'react';

import { Lightbulb } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';

import type { AssignmentAnalytics } from 'types/assignment';

type Props = {
  analytics: AssignmentAnalytics;
};

const AssignmentEssayEditorPromptChart = ({ analytics }: Props) => {
  const promptNatureData = useMemo(
    () => [
      {
        name: 'Perform-oriented',
        count: analytics.nature_counts['perform'],
        color: '#ef4444',
      },
      {
        name: 'Learning-oriented',
        count: analytics.nature_counts['learning'],
        color: '#22c55e',
      },
    ],
    [analytics.nature_counts],
  );

  return (
    <Card
      classes={{ title: 'flex items-center gap-2', description: '-mt-2 mb-4' }}
      description="Analysis of your AI interaction patterns"
      title={
        <>
          <Lightbulb className="h-5 w-5" />
          Prompt Categories
        </>
      }
    >
      <ResponsiveContainer height={300} width="100%">
        <BarChart data={promptNatureData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <RechartsTooltip />
          <Bar dataKey="count" fill="#8b5cf6">
            {promptNatureData.map((entry, index) => (
              <Cell fill={entry.color} key={`cell-${index}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium">Performance-oriented</span>
          </div>
          <Badge variant="secondary">
            {analytics.nature_counts['perform']} prompts
          </Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">Learning-oriented</span>
          </div>
          <Badge variant="secondary">
            {analytics.nature_counts['learning']} prompts
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default AssignmentEssayEditorPromptChart;
