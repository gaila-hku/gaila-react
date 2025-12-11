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
};

const DashboardAnalyticsSummary = ({
  assignment,
  essay,
  goalContent,
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
      <Card
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

      {!!goalContent && (
        <Card
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
      <Card
        title={
          <div className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Complexity Score
          </div>
        }
      >
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold">54%</p>
          <p className="text-xs text-muted-foreground">(lexical)</p>
          <p className="pl-4 text-2xl font-bold">60%</p>
          <p className="text-xs text-muted-foreground">(syntatic)</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Indicates the variety of literary devices used
        </p>
      </Card>

      <Card
        title={
          <div className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Accuracy Score
          </div>
        }
      >
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold">86%</p>
          <p className="text-xs text-muted-foreground">(lexical)</p>
          <p className="text-2xl font-bold">82%</p>
          <p className="text-xs text-muted-foreground">(syntatic)</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Indicates if your essay is error free
        </p>
      </Card>
    </>
  );
};

export default DashboardAnalyticsSummary;
