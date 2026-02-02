import React, { useMemo } from 'react';

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

import { getAgentName } from 'containers/common/Dashboard/utils';

import type { AgentUsageDataItem } from 'types/assignment';

type Props = {
  usageData: AgentUsageDataItem[];
};

const DashboardAgentUsage = ({ usageData }: Props) => {
  const chartData = useMemo(() => {
    return usageData
      .sort((a, b) => b.agent_uses - a.agent_uses)
      .map(item => ({
        agentType: getAgentName(item.agent_type),
        'Agent uses': item.agent_uses,
        'Follow-up prompts': item.prompts,
        color: '#3b82f6',
      }));
  }, [usageData]);

  return (
    <>
      <div className="space-y-3">
        <ResponsiveContainer height={usageData.length * 50} width="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="agentType" type="category" width={120} />
            <RechartsTooltip
              formatter={value => `${value} time${value === 1 ? '' : 's'}`}
            />
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
          Utilize follow-up prompts when you don&apos;t understand AI&apos;s
          output
        </p>
      </div>
    </>
  );
};

export default DashboardAgentUsage;
