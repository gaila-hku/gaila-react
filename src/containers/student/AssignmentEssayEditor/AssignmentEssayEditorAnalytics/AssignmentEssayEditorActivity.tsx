import React, { useMemo } from 'react';

import clsx from 'clsx';
import { BarChart3, ClipboardList, Languages, Wrench } from 'lucide-react';
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

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';

import type { AssignmentAnalytics } from 'types/assignment';
import getStageTypeLabel from 'utils/helper/getStageTypeLabel';
import getToolName from 'utils/helper/getToolName';

type Props = {
  analytics: AssignmentAnalytics;
};

const getToolClass = (tool: string) => {
  switch (tool) {
    case 'dictionary':
      return 'bg-blue-50';
    case 'grammar':
      return 'bg-purple-50';
    default:
      return 'bg-green-50';
  }
};

const getToolIcon = (tool: string) => {
  switch (tool) {
    case 'dictionary':
      return <Languages className="h-5 w-5 text-blue-600 mb-1" />;
    case 'grammar':
      return <ClipboardList className="h-5 w-5 text-purple-600 mb-1" />;
    default:
      return <Wrench className="h-5 w-5 text-green-600 mb-1" />;
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'goal_setting':
      return '#3b82f6';
    case 'writing':
      return '#8b5cf6';
    default:
      return '#10b981';
  }
};

type TimelineChartData = {
  stageType: string;
  Time: number;
  color: string;
};

const AssignmentEssayEditorActivity = ({ analytics }: Props) => {
  const timelineData: TimelineChartData[] = useMemo(() => {
    return analytics.timeline_data.map(item => {
      let time = 0;
      if (item.start_time && item.end_time) {
        time = (item.end_time - item.start_time) / 60000;
      } else if (item.start_time) {
        time = (Date.now() - item.start_time) / 60000;
      }
      return {
        stageType: getStageTypeLabel(item),
        Time: time,
        color: getStageColor(item.stage_type),
      };
    });
  }, [analytics.timeline_data]);

  const toolUsageData = useMemo(() => {
    return analytics.prompt_data.tool_counts.reduce(
      (acc, item) => {
        return {
          ...acc,
          [item.key]: {
            count: (acc[item.key]?.count || 0) + (item.count || 0),
            class_average:
              (acc[item.key]?.class_average || 0) + (item.class_average || 0),
          },
        };
      },
      {} as Record<string, { count: number; class_average: number }>,
    );
  }, [analytics.prompt_data.tool_counts]);

  return (
    <Card
      classes={{ description: '-mt-2 mb-4', root: 'h-fit' }}
      description="How you spend your time in this assignment"
      title={
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Activity Breakdown
        </div>
      }
    >
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Writing Stage Timeline</h4>
        <ResponsiveContainer height={200} width="100%">
          <BarChart
            data={timelineData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              label={{ value: 'Minutes', position: 'bottom' }}
              type="number"
            />
            <YAxis dataKey="stageType" type="category" width={80} />
            <RechartsTooltip formatter={value => `${value} min(s)`} />
            <Bar dataKey="Time" radius={[0, 8, 8, 0]}>
              {timelineData.map((entry, index) => (
                <Cell fill={entry.color} key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Divider />

      {/* AI Tools Usage */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <h4 className="text-sm font-semibold">AI Tools Engagement</h4>
        </div>
        <div className="flex gap-3">
          {Object.entries(toolUsageData).map(([toolKey, item]) => (
            <div
              className={clsx(
                'flex-1 flex flex-col items-center p-3 border rounded-lg',
                getToolClass(toolKey),
              )}
              key={toolKey}
            >
              {getToolIcon(toolKey)}
              <p className="text-xs text-muted-foreground">
                {getToolName(toolKey)}
              </p>
              <p className="text-lg font-bold">{item.count}</p>
              <p className="text-muted-background text-xs">
                Class Average: {item.class_average}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AssignmentEssayEditorActivity;
