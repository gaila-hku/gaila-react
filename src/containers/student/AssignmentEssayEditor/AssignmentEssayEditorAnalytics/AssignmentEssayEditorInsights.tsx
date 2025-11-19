import React, { useMemo } from 'react';

import { uniq } from 'lodash-es';
import { Lightbulb } from 'lucide-react';

import Card from 'components/display/Card';

import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import type { AssignmentAnalytics } from 'types/assignment';

type Props = {
  analytics: AssignmentAnalytics;
};

const AssignmentEssayEditorInsights = ({ analytics }: Props) => {
  const { getEssayWordCount, assignmentProgress, assignment, goals } =
    useAssignmentEssayEditorProvider();

  const wordCountProgress = useMemo(() => {
    if (
      !assignment?.requirements?.min_word_count &&
      !assignment?.requirements?.max_word_count
    ) {
      return '';
    }
    const wordCount = getEssayWordCount();
    if (
      assignment.requirements.min_word_count &&
      wordCount < assignment.requirements.min_word_count
    ) {
      return `You need ${assignment.requirements.min_word_count - wordCount} more words to meet the minimum requirement.`;
    }
    if (
      assignment.requirements.max_word_count &&
      wordCount > assignment.requirements.max_word_count
    ) {
      return `You need ${wordCount - assignment.requirements.max_word_count} less words to meet the maximum requirement.`;
    }
    if (assignment.requirements.min_word_count) {
      return `Great! You've met the minimum word requirement of ${assignment.requirements.min_word_count} words.`;
    }
    return `Great! You've met the maximum word requirement of ${assignment.requirements.max_word_count} words.`;
  }, [assignment, getEssayWordCount]);

  const totalGoals = useMemo(() => goals.flatMap(g => g.goals).length, [goals]);
  const completedGoals = useMemo(
    () => goals.flatMap(g => g.goals).filter(g => g.completed).length,
    [goals],
  );

  const learningPrompts = useMemo(
    () =>
      analytics.prompt_data.aspect_counts.reduce(
        (acc, t) => acc + (t.key === 'learning' ? t.count || 0 : 0),
        0,
      ),
    [analytics],
  );

  const totalTools = useMemo(
    () => assignmentProgress?.stages.flatMap(s => s.tools).length,
    [assignmentProgress],
  );
  const usedTools = useMemo(
    () => uniq(analytics.prompt_data.tool_counts.map(t => t.key)).length,
    [analytics.prompt_data.tool_counts],
  );

  return (
    <Card
      classes={{
        description: '-mt-2 mb-4',
        title: 'flex items-center gap-2',
        root: 'h-fit',
      }}
      description="Based on your current assignment data"
      title={
        <>
          <Lightbulb className="h-5 w-5" />
          Writing Insights
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
          <div>
            <p className="text-sm font-medium">AI Assistance Usage</p>
            <p className="text-xs text-muted-foreground mt-1">
              {learningPrompts / analytics.prompt_data.total_prompt_count > 0.5
                ? "You're using AI primarily for learning, which helps develop your writing skills!"
                : 'Consider using more learning-oriented prompts to improve your writing understanding.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-blue-950/20 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
          <div>
            <p className="text-sm font-medium">Tool Usage</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTools === usedTools
                ? "You're using all AI tools, which helps develop your writing skills!"
                : 'Consider using a wider range of tools to aid your writing.'}
            </p>
          </div>
        </div>

        {!!wordCountProgress && (
          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
            <div>
              <p className="text-sm font-medium">Word Count Progress</p>
              <p className="text-xs text-muted-foreground mt-1">
                {wordCountProgress}
              </p>
            </div>
          </div>
        )}

        {goals.length > 0 && (
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
            <div>
              <p className="text-sm font-medium">Goal Achievement</p>
              <p className="text-xs text-muted-foreground mt-1">
                You&apos;ve completed {completedGoals} out of {totalGoals}{' '}
                goals.
                {completedGoals === totalGoals
                  ? ' Excellent work!'
                  : ' Keep working towards your remaining goals!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AssignmentEssayEditorInsights;
