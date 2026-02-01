import React, { useMemo } from 'react';

import { Brain, FileText, Goal, Target } from 'lucide-react';

import Card from 'components/display/Card';

import type {
  Assignment,
  AssignmentGoalContent,
  PromptAnalytics,
} from 'types/assignment';
import getGoalCounts from 'utils/helper/getGoalCounts';
import getWordCount from 'utils/helper/getWordCount';

type Props = {
  promptAnalytics: PromptAnalytics;
  assignment: Assignment;
  essay: string;
  goalContent: AssignmentGoalContent | null;
  enabledFlags?: Record<string, boolean>;
};

const DashboardAnalyticsSummary = ({
  assignment,
  essay,
  goalContent,
  enabledFlags,
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

  const [completeGoalCount, totalGoalCount] = useMemo(
    () => getGoalCounts(goalContent),
    [goalContent],
  );

  return (
    <>
      {(!enabledFlags || enabledFlags.word_count) && (
        <Card
          className="h-fit"
          title={
            <div className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Word Count
            </div>
          }
        >
          <p className="text-2xl font-bold">{getWordCount(essay)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {wordCountRequirement}
          </p>
        </Card>
      )}

      {(!enabledFlags || enabledFlags.goal_progress) && !!goalContent && (
        <Card
          className="h-fit"
          title={
            <div className="text-sm flex items-center gap-2">
              <Goal className="h-4 w-4" />
              Goals Progress
            </div>
          }
        >
          <p className="text-2xl font-bold">
            {completeGoalCount}/{totalGoalCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Goals completed</p>
        </Card>
      )}

      {/* FIXME: demo data */}
      {/* {(!enabledFlags || enabledFlags.complexity_scores) && (
        <Card
          className="h-fit"
          title={
            <div className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Complexity Score
            </div>
          }
        >
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">WIP</p>
            <p className="text-xs text-muted-foreground">(lexical)</p>
            <p className="pl-4 text-2xl font-bold">WIP</p>
            <p className="text-xs text-muted-foreground">(syntatic)</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Indicates the variety of literary devices used
          </p>
        </Card>
      )}

      {(!enabledFlags || enabledFlags.accuracy_scores) && (
        <Card
          className="h-fit"
          title={
            <div className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Accuracy Score
            </div>
          }
        >
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">WIP</p>
            <p className="text-xs text-muted-foreground">(lexical)</p>
            <p className="text-2xl font-bold">WIP</p>
            <p className="text-xs text-muted-foreground">(syntatic)</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Indicates if your essay is error free
          </p>
        </Card>
      )} */}
    </>
  );
};

export default DashboardAnalyticsSummary;
