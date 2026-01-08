import React, { useMemo } from 'react';

import { Info } from 'lucide-react';
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
import Tabs from 'components/navigation/Tabs';

import PromptHistory from 'containers/teacher/SubmissionDetails/SubmissionDetailsAnalytics/PromptHistory';

import type { PromptAnalytics } from 'types/assignment';

type Props = {
  assignmentId: number;
  promptData: PromptAnalytics;
  showAspect?: boolean;
  showHistory?: boolean;
};

const natureKeyMap = {
  perform: 'Perform-oriented',
  learning: 'Learning-oriented',
};

const aspectKeyMap = {
  content_idea: 'Content and Idea',
  structure: 'Structure Help',
  revision: 'Revision',
  language: 'Language Help',
  rhetoric: 'Rhetoric Help',
  error_correction: 'Error Correction',
};

const DashboardPromptChart = ({
  assignmentId,
  promptData,
  showAspect,
  showHistory,
}: Props) => {
  const promptNatureData = useMemo(() => {
    const structuredData = promptData.nature_counts.reduce((acc, item) => {
      const natureName = natureKeyMap[item.key];
      const current = acc[item.key] || {
        name: natureName,
        count: 0,
        class_avg: 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      };
      return {
        ...acc,
        [item.key]: {
          ...current,
          count: current.count + (item.count || 0),
          class_avg: current.class_avg + (item.class_average || 0),
        },
      };
    }, {});

    return Object.entries(natureKeyMap).map(([key, name]) => ({
      name,
      'Your Prompts': structuredData[key]?.count || 0,
      'Class Avg': structuredData[key]?.class_avg || 0,
      selfColor: '#aac5f2',
      classColor: '#f2b1bc',
    }));
  }, [promptData]);

  const promptNatureChart = useMemo(() => {
    return (
      <>
        <ResponsiveContainer
          className="max-w-[600px] mx-auto"
          height={300}
          width="100%"
        >
          <BarChart data={promptNatureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <RechartsTooltip />
            <Bar dataKey="Your Prompts" fill="#8b5cf6">
              {promptNatureData.map((entry, index) => (
                <Cell fill={entry.selfColor} key={`selfCount-cell-${index}`} />
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
                <span className="text-sm font-medium">{entry.name}</span>
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
          <div className="flex gap-2 text-muted-foreground items-center">
            <Info className="h-4 w-4" />
            <p className="text-sm">
              Perform-oriented prompts focus on getting answers, while
              learning-oriented prompts focus on understanding concepts.
            </p>
          </div>
        </div>
      </>
    );
  }, [promptNatureData]);

  const promptAspectData = useMemo(() => {
    const structuredData = promptData.aspect_counts.reduce((acc, item) => {
      const aspectName = aspectKeyMap[item.key];
      const current = acc[item.key] || {
        name: aspectName,
        count: 0,
        class_avg: 0,
        selfColor: '#aac5f2',
        classColor: '#f2b1bc',
      };
      return {
        ...acc,
        [item.key]: {
          ...current,
          count: current.count + (item.count || 0),
          class_avg: current.class_avg + (item.class_average || 0),
        },
      };
    }, {});

    return Object.entries(aspectKeyMap).map(([key, name]) => ({
      name,
      'Your Prompts': structuredData[key]?.count || 0,
      'Class Avg': structuredData[key]?.class_avg || 0,
      selfColor: '#aac5f2',
      classColor: '#f2b1bc',
    }));
  }, [promptData]);

  const promptAspectChart = useMemo(() => {
    return (
      <>
        <ResponsiveContainer height={300} width="100%">
          <BarChart data={promptAspectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <RechartsTooltip />
            <Bar dataKey="Your Prompts" fill="#8b5cf6">
              {promptAspectData.map((entry, index) => (
                <Cell fill={entry.selfColor} key={`selfCount-cell-${index}`} />
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
                <span className="text-sm font-medium">{entry.name}</span>
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
    );
  }, [promptAspectData]);

  const tabs = useMemo(
    () => [
      {
        key: 'nature',
        title: 'Perform vs Learning',
        content: promptNatureChart,
      },
      ...(showAspect
        ? [
            {
              key: 'aspect',
              title: 'Aspects of writing',
              content: promptAspectChart,
            },
          ]
        : []),
      ...(showHistory
        ? [
            {
              key: 'history',
              title: 'Prompt History',
              content: <PromptHistory assignmentId={assignmentId} />,
            },
          ]
        : []),
    ],
    [
      assignmentId,
      promptAspectChart,
      promptNatureChart,
      showAspect,
      showHistory,
    ],
  );

  if (tabs.length === 1) {
    return tabs[0].content;
  }

  return <Tabs tabs={tabs} />;
};

export default DashboardPromptChart;
