import React, { useMemo } from 'react';

import Tooltip from '@mui/material/Tooltip';
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
  content_idea: {
    name: 'Content and Idea',
    tooltip:
      'Content Idea:\n' +
      'Seek idea inspirations or other help related to the drafting of the content of the essay.\n' +
      '\n' +
      'Examples:\n' +
      '- Give me advantages of e-sports\n' +
      '- Write the full speech in 500 words\n' +
      '- Help me elaborate more on how playing e-sports is a team effort\n' +
      '- Downsides of indulging in e-sports\n' +
      '- The example of teamwork games',
  },
  structure: {
    name: 'Structure Help',
    tooltip:
      'Structure Help:\n' +
      'Help to generate a written product by structuring or organizing the pieces of ideas provided by the learners or ask for tips/advices to learners on how to do so.\n' +
      '\n' +
      'Examples:\n' +
      '- Can you help me to organise my ideas for my speech?\n' +
      '- Organize these ideas into a logic argument\n' +
      '- What are the structure/key elements of an effective outline for a speech?\n' +
      '- Provide me with an outline structure for a persuasive speech\n' +
      '- How should I start a speech?',
  },
  revision: {
    name: 'Revision',
    tooltip:
      'Revision:\n' +
      "Make revisions on learners' written products concerning the ideas/content and structures of the contents or provide tips on how to revise existent written products in terms of ideas/content and/or structures.\n" +
      '\n' +
      'Examples:\n' +
      '- Rearrange my essay to make it flow better\n' +
      '- Structure my essay to make it more persuasive\n' +
      '- Please help me check the outline and give me some suggestions\n' +
      '- Is my paragraphing and overall flow ok?\n' +
      '- Highlight the parts that need revision',
  },
  language: {
    name: 'Language Help',
    tooltip:
      'Language help:\n' +
      'Help with the recall / retrieval / selection of word- or sentence structure to convey / express intended meaning.\n' +
      '\n' +
      'Examples:\n' +
      '- Words similar to thrilling\n' +
      '- Translate this sentence into English\n' +
      '- Rephrase the word “reaction”\n' +
      '- Give me some useful expressions that I can use for the essay\n' +
      '- What are some useful sentence structures to use in an essay about e-sport?',
  },
  rhetoric: {
    name: 'Rhetoric Help',
    tooltip:
      'Rhetoric Help:\n' +
      'The use of rhetoric devices and strategies to enhance the persuasive and emotional impact of communication. This includes guidance on word choice, rhetoric devices, tone and style, persuasive techniques, and conciseness to strengthen the overall effectiveness of the message.\n' +
      '\n' +
      'Examples:\n' +
      '- What are some effective persuasive phrases I can use in my speech about e-sports?\n' +
      '- Give me some powerful language devices for the essay\n' +
      '- Provide me a hook in the introduction\n' +
      '- How to start a speech that attracts the audience\n' +
      '- How to make the language more persuasive?',
  },
  error_correction: {
    name: 'Error Correction',
    tooltip:
      'Error Correction:\n' +
      'Identify or correct language errors at word or sentence structure level.\n' +
      '\n' +
      'Examples:\n' +
      '- Can you help me to correct the tenses in the draft?\n' +
      '- Check the language of this essay and revise sentence by sentence\n' +
      '- List the problematic sentences in the essay\n' +
      '- Is my language and tone used correctly?',
  },
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
      const current = acc[item.key] || {
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

    return Object.entries(aspectKeyMap).map(([key, obj]) => ({
      key,
      name: obj.name,
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
            <XAxis
              dataKey="key"
              tick={({ x, y, payload }) => {
                return (
                  <>
                    <g transform={`translate(${x},${y})`}>
                      <text
                        dy={8}
                        fill="#666"
                        fontSize={12}
                        textAnchor="middle"
                        x={0}
                        y={0}
                      >
                        {aspectKeyMap[payload.value].name}
                      </text>
                    </g>
                    <Tooltip
                      title={
                        <p className="whitespace-pre-wrap text-sm">
                          {aspectKeyMap[payload.value].tooltip}
                        </p>
                      }
                    >
                      <g transform={`translate(${x + 46},${y - 4})`}>
                        <svg
                          className="lucide lucide-info absolute top-0 right-0 z-10"
                          fill="white"
                          height="16"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                      </g>
                    </Tooltip>
                  </>
                );
              }}
            />
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
