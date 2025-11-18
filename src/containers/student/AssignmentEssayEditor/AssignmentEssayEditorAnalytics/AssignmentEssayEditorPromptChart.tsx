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
import Tabs from 'components/navigation/Tabs';

import type { AssignmentAnalytics } from 'types/assignment';

type Props = {
  analytics: AssignmentAnalytics;
};

const AssignmentEssayEditorPromptChart = ({ analytics }: Props) => {
  const promptNatureData = useMemo(
    () => [
      {
        name: 'Perform-oriented',
        'Your Prompts': analytics.nature_counts['perform'] || 0,
        'Class Avg': analytics.nature_counts_class['perform'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
      {
        name: 'Learning-oriented',
        'Your Prompts': analytics.nature_counts['learning'] || 0,
        'Class Avg': analytics.nature_counts_class['learning'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
    ],
    [analytics],
  );

  const promptAspectData = useMemo(
    () => [
      {
        name: 'Content Idea',
        'Your Prompts': analytics.aspect_counts['content_idea'] || 0,
        'Class Avg': analytics.aspect_counts_class['content_idea'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
      {
        name: 'Structure Help',
        'Your Prompts': analytics.aspect_counts['structure'] || 0,
        'Class Avg': analytics.aspect_counts_class['structure'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
      {
        name: 'Revision',
        'Your Prompts': analytics.aspect_counts['revision'] || 0,
        'Class Avg': analytics.aspect_counts_class['revision'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
      {
        name: 'Language Help',
        'Your Prompts': analytics.aspect_counts['language'] || 0,
        'Class Avg': analytics.aspect_counts_class['language'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
      {
        name: 'Rhetoric Help',
        'Your Prompts': analytics.aspect_counts['rhetoric'] || 0,
        'Class Avg': analytics.aspect_counts_class['rhetoric'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
      {
        name: 'Error Correction',
        'Your Prompts': analytics.aspect_counts['error_correction'] || 0,
        'Class Avg': analytics.aspect_counts_class['error_correction'] || 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      },
    ],
    [analytics],
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
      <Tabs
        tabs={[
          {
            key: 'nature',
            title: 'Perform vs Learning',
            content: (
              <>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={promptNatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar dataKey="Your Prompts" fill="#8b5cf6">
                      {promptNatureData.map((entry, index) => (
                        <Cell
                          fill={entry.selfColor}
                          key={`selfCount-cell-${index}`}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Class Avg" fill="#8b5cf6">
                      {promptNatureData.map((entry, index) => (
                        <Cell
                          fill={entry.classColor}
                          key={`classCount-cell-${index}`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {promptNatureData.map((entry, index) => (
                    <div
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      key={`nature-${index}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="!bg-[#aac5f2a0]" variant="secondary">
                          You: {entry['Your Prompts']} prompts
                        </Badge>
                        <Badge className="!bg-[#f2b1bca0]" variant="secondary">
                          Class Avg: {entry['Class Avg']} prompts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ),
          },
          {
            key: 'aspect',
            title: 'Aspects of writing',
            content: (
              <>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={promptAspectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar dataKey="Your Prompts" fill="#8b5cf6">
                      {promptAspectData.map((entry, index) => (
                        <Cell
                          fill={entry.selfColor}
                          key={`selfCount-cell-${index}`}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Class Avg" fill="#8b5cf6">
                      {promptAspectData.map((entry, index) => (
                        <Cell
                          fill={entry.classColor}
                          key={`classCount-cell-${index}`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {promptAspectData.map((entry, index) => (
                    <div
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      key={`nature-${index}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="!bg-[#aac5f2a0]" variant="secondary">
                          You: {entry['Your Prompts']} prompts
                        </Badge>
                        <Badge className="!bg-[#f2b1bca0]" variant="secondary">
                          Class Avg: {entry['Class Avg']} prompts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default AssignmentEssayEditorPromptChart;
