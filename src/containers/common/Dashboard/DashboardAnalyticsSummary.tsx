import React, { useMemo } from 'react';

import { FileText, Sparkles, Target, Wrench } from 'lucide-react';

import Card from 'components/display/Card';

import type {
  Assignment,
  AssignmentGoal,
  PromptAnalytics,
} from 'types/assignment';

type Props = {
  promptAnalytics: PromptAnalytics;
  assignment: Assignment;
  getEssayWordCount: () => number;
  goals: AssignmentGoal[];
};

const DashboardAnalyticsSummary = ({
  promptAnalytics,
  assignment,
  getEssayWordCount,
  goals,
}: Props) => {
  const wordCountRequirement = useMemo(() => {
    if (!assignment) {
      return '';
    }
    if (
      assignment.requirements?.min_word_count &&
      assignment.requirements.max_word_count
    ) {
      return `${assignment.requirements.min_word_count} - ${assignment.requirements.max_word_count} words required`;
    }
    if (assignment.requirements?.min_word_count) {
      return `>${assignment.requirements.min_word_count} words required`;
    }
    if (assignment.requirements?.max_word_count) {
      return `<${assignment.requirements.max_word_count} words required`;
    }
    return 'No word requirement';
  }, [assignment]);

  const toolUseCount = useMemo(() => {
    return Object.values(promptAnalytics.tool_counts).reduce(
      (acc, t) => acc + (t.count || 0),
      0,
    );
  }, [promptAnalytics.tool_counts]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title={
          <div className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Word Count
          </div>
        }
      >
        <p className="text-2xl font-bold">{getEssayWordCount()}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {wordCountRequirement}
        </p>
      </Card>

      <Card
        title={
          <div className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Prompts
          </div>
        }
      >
        <p className="text-2xl font-bold">
          {promptAnalytics.total_prompt_count}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {promptAnalytics.nature_counts.reduce(
            (acc, n) => acc + (n.key === 'learning' ? n.count || 0 : 0),
            0,
          )}{' '}
          learning-focused
        </p>
      </Card>

      <Card
        title={
          <div className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools Used
          </div>
        }
      >
        <p className="text-2xl font-bold">{toolUseCount}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {toolUseCount
            ? `${Object.values(promptAnalytics.tool_counts).filter(t => !!t.count).length} different tools`
            : 'No tools used yet'}
        </p>
      </Card>

      <Card
        title={
          <div className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals Progress
          </div>
        }
      >
        <p className="text-2xl font-bold">
          {goals.reduce(
            (acc, g) => acc + g.goals.filter(g => g.completed).length,
            0,
          )}
          /{goals.reduce((acc, g) => acc + g.goals.length, 0)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Goals completed</p>
      </Card>
    </div>
  );
};

export default DashboardAnalyticsSummary;
