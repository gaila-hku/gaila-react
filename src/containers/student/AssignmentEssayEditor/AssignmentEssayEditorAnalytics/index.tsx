import React, { useState } from 'react';

import { BarChart3, Lightbulb, Wrench } from 'lucide-react';
import { useQuery } from 'react-query';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import AssignmentEssayEditorAnalyticsSummary from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorAnalyticsSummary';
import AssignmentEssayEditorPlagiarismDetector from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorPlagiarismDetector';
import AssignmentEssayEditorPromptChart from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorPromptChart';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiGetAssignmentAnalytics } from 'api/assignment';
import getToolName from 'utils/helper/getToolName';
import tuple from 'utils/types/tuple';

const AssignmentEssayEditorAnalytics = () => {
  const { assignmentProgress } = useAssignmentEssayEditorProvider();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery(
    tuple([
      apiGetAssignmentAnalytics.queryKey,
      assignmentProgress?.assignment.id as number,
    ]),
    apiGetAssignmentAnalytics,
    { enabled: !!assignmentProgress?.assignment.id },
  );

  const [toolsUsedSet] = useState(new Set<string>());

  const totalTime = Math.floor(Date.now() / 1000 / 60);
  const usageChartData = [
    {
      name: 'Writing',
      value: totalTime > 0 ? totalTime : 125,
      color: '#8b5cf6',
    },
    {
      name: 'Dictionary',
      value: toolsUsedSet.has('Dictionary') ? 15 : 0,
      color: '#3b82f6',
    },
    {
      name: 'Tools',
      value:
        (toolsUsedSet.size - (toolsUsedSet.has('AI Assistant') ? 1 : 0)) * 5,
      color: '#10b981',
    },
    {
      name: 'AI Chat',
      value: 6,
      color: '#f59e0b',
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (error || !analytics) {
    return <ErrorComponent error={error || 'Failed to get analytics'} />;
  }

  return (
    <div className="space-y-6">
      <AssignmentEssayEditorAnalyticsSummary analytics={analytics} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Usage Pie Chart */}
        <Card
          classes={{ description: '-mt-2 mb-4' }}
          description="How you spend your time in this session"
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activity Breakdown
            </div>
          }
        >
          <ResponsiveContainer height={300} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={usageChartData.filter(d => d.value > 0)}
                dataKey="value"
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name}: ${(percent || 0 * 100).toFixed(0)}%`
                }
                labelLine={false}
                outerRadius={100}
              >
                {usageChartData.map((entry, index) => (
                  <Cell fill={entry.color} key={`cell-${index}`} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {usageChartData
              .filter(d => d.value > 0)
              .map(item => (
                <div
                  className="flex items-center gap-2 text-sm"
                  key={item.name}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.value} min
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <AssignmentEssayEditorPromptChart analytics={analytics} />

        <AssignmentEssayEditorPlagiarismDetector
          plagiarisedSegments={analytics.plagiarised_segments}
        />

        {/* Tools Used */}
        <Card
          classes={{ children: 'space-y-2', description: '-mt-2 mb-4' }}
          description="Writing tools you've utilized in this session"
          title={
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Tools & Features Used
            </div>
          }
        >
          {Object.entries(analytics.tool_counts).map(([toolKey, count]) => (
            <div
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 rounded-lg"
              key={toolKey}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {getToolName(toolKey)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="!bg-[#aac5f2a0]" variant="secondary">
                  You: {count} uses
                </Badge>
                <Badge className="!bg-[#f2b1bca0]" variant="secondary">
                  Class Avg: {analytics.tool_counts_class[toolKey]} uses
                </Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card
          classes={{
            description: '-mt-2 mb-4',
            title: 'flex items-center gap-2',
          }}
          description="Based on your current session"
          title={
            <>
              <Lightbulb className="h-5 w-5" />
              Writing Insights
            </>
          }
        >
          {/* Insights */}
          <div className="space-y-4">
            {/* <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
            <div>
              <p className="text-sm font-medium">Word Count Progress</p>
              <p className="text-xs text-muted-foreground mt-1">
                {wordCount >= currentAssignment.requirements.wordCount.min
                  ? `Great! You've met the minimum word requirement of ${currentAssignment.requirements.wordCount.min} words.`
                  : `You need ${currentAssignment.requirements.wordCount.min - wordCount} more words to meet the minimum requirement.`}
              </p>
            </div>
          </div>

          {localGoals.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Goal Achievement</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You've completed {localGoals.filter(g => g.completed).length}{' '}
                  out of {localGoals.length} goals.
                  {localGoals.filter(g => g.completed).length ===
                  localGoals.length
                    ? ' Excellent work!'
                    : ' Keep working towards your remaining goals!'}
                </p>
              </div>
            </div>
          )}

          {chatMessages.filter(m => m.role === 'user').length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">AI Assistance Usage</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {promptCategoryData[1].count > promptCategoryData[0].count
                    ? "You're using AI primarily for learning, which helps develop your writing skills!"
                    : 'Consider using more learning-oriented prompts to improve your writing understanding.'}
                </p>
              </div>
            </div>
          )} */}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentEssayEditorAnalytics;
