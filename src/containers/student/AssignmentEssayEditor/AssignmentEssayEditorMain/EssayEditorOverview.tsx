import React, { useMemo } from 'react';

import dayjs from 'dayjs';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ClipboardList,
  GraduationCap,
  Star,
  Target,
} from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Divider from 'components/display/Divider';

import AssignmentGoalChecker from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/AssignmentGoalChecker';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import type {
  Assignment,
  AssignmentGoalContent,
  AssignmentGrade,
} from 'types/assignment';
import getGoalCounts from 'utils/helper/getGoalCounts';

type Props = {
  grade: AssignmentGrade | null;
  assignment: Assignment;
  onChangeGoals: (goals: AssignmentGoalContent | null) => void;
  readonly: boolean;
};

const EssayEditorOverview = ({ grade, assignment, onChangeGoals }: Props) => {
  const { goalContent, readonly } = useAssignmentEssayEditorProvider();

  const wordCountDisplay = useMemo(() => {
    let display = '';
    if (assignment.requirements?.min_word_count) {
      display += assignment?.requirements?.min_word_count;
    }
    if (
      assignment.requirements?.min_word_count &&
      assignment?.requirements?.max_word_count
    ) {
      display += ' - ';
    } else if (assignment?.requirements?.max_word_count) {
      display += '<';
    } else if (assignment?.requirements?.min_word_count) {
      display = '>' + display;
    }
    if (assignment.requirements?.max_word_count) {
      display += assignment?.requirements?.max_word_count;
    }
    return display;
  }, [
    assignment.requirements?.max_word_count,
    assignment.requirements?.min_word_count,
  ]);

  const overallMaxPoints = useMemo(() => {
    if (!assignment.rubrics) {
      return 0;
    }
    return assignment.rubrics?.reduce((acc, rubric) => {
      return acc + rubric.max_points;
    }, 0);
  }, [assignment.rubrics]);

  const hasWordCountRequirement = useMemo(() => {
    return (
      assignment?.requirements?.min_word_count ||
      assignment?.requirements?.max_word_count
    );
  }, [
    assignment?.requirements?.max_word_count,
    assignment?.requirements?.min_word_count,
  ]);

  const [completedGoalCount, totalGoalCount] = useMemo(
    () => getGoalCounts(goalContent),
    [goalContent],
  );

  return (
    <div className="space-y-4">
      {!!grade && (
        <Card
          classes={{
            root: 'border-purple-200 bg-gradient-to-br from-purple-50 to-white !p-4',
            title: 'flex items-center gap-2 text-base',
            children: 'space-y-4',
          }}
          title={
            <>
              <Star className="h-5 w-5 text-purple-600" />
              Your Grade
            </>
          }
        >
          {/* Overall Score */}
          <div className="text-center p-3 bg-white rounded-lg border-2 border-purple-200">
            <p className="text-xs text-muted-foreground mb-1">Final Score</p>
            <p className="text-3xl font-bold text-purple-600">
              {grade.overall_score}
              {!!overallMaxPoints && (
                <span className="text-lg text-muted-foreground">
                  /{overallMaxPoints}
                </span>
              )}
            </p>
            {!!overallMaxPoints && (
              <Badge className="mt-2 bg-purple-600 text-xs">
                {Math.round((grade.overall_score / overallMaxPoints) * 100)}%
              </Badge>
            )}
          </div>

          {/* Criteria Breakdown */}
          <div className="max-h-[400px] overflow-auto">
            <div className="space-y-2 pr-4">
              {Object.entries(grade.rubrics_breakdown)?.map(
                ([criterion, score]) => (
                  <div
                    className="p-2 bg-white border rounded text-xs space-y-1.5"
                    key={criterion}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{criterion}</span>
                      <Badge className="text-xs" variant="outline">
                        {score}/
                        {
                          assignment.rubrics?.find(
                            r => r.criteria === criterion,
                          )?.max_points
                        }
                      </Badge>
                    </div>
                  </div>
                ),
              )}

              {/* Overall Feedback */}
              <div className="p-2 bg-white border rounded text-xs mt-2">
                <h4 className="font-semibold mb-1.5 flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Teacher Feedback
                </h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed mb-2">
                  {grade.overall_feedback}
                </p>
                <Divider className="my-2" />
                <div className="flex flex-col gap-1 text-muted-foreground">
                  <span>Graded by: {grade.graded_by}</span>
                  <span>{dayjs(grade.graded_at).format('MMM D, YYYY')}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!!goalContent && (
        <Card
          classes={{
            title: 'flex items-center gap-2 text-base -mb-2',
            description: 'text-xs',
            header: 'mb-2',
            children: 'space-y-3',
          }}
          description="Track your writing goals for this essay"
          title={
            <>
              <Target className="h-4 w-4" />
              Your Goals
            </>
          }
        >
          <AssignmentGoalChecker
            goals={goalContent}
            onChangeGoals={onChangeGoals}
            readonly={readonly}
          />

          <Divider />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {completedGoalCount} / {totalGoalCount} completed
            </span>
          </div>
        </Card>
      )}

      {/* Assignment Prompt */}
      {!!assignment.instructions && (
        <Card
          classes={{
            children: 'space-y-3',
            title: 'flex items-center gap-2 text-base',
            root: '!p-4',
          }}
          title={
            <>
              <BookOpen className="h-4 w-4" />
              Instructions
            </>
          }
        >
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {assignment.instructions}
          </p>
        </Card>
      )}

      {hasWordCountRequirement && (
        <Card
          classes={{
            children: 'space-y-3',
            title: 'flex items-center gap-2 text-base',
            root: '!p-4',
          }}
          title={
            <>
              <ClipboardList className="h-4 w-4" /> Requirements
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Word Count:</span>
              <span>{wordCountDisplay}</span>
            </div>
          </div>
        </Card>
      )}

      {!!assignment.rubrics?.length && (
        <Card
          classes={{
            children: 'space-y-2',
            title: 'flex items-center gap-2 text-base',
            root: '!p-4',
          }}
          title={
            <>
              <Star className="h-4 w-4" />
              Grading Rubric
            </>
          }
        >
          {assignment.rubrics.map((item, index) => (
            <div
              className="flex items-center justify-between text-sm"
              key={index}
            >
              <span className="text-muted-foreground">{item.criteria}</span>
              <Badge className="text-xs" variant="outline">
                {item.max_points}pts
              </Badge>
            </div>
          ))}
          <Divider />
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total</span>
            <Badge className="text-xs">
              {assignment.rubrics.reduce(
                (total, item) => total + item.max_points,
                0,
              )}
              pts
            </Badge>
          </div>
        </Card>
      )}

      {!!assignment.tips?.length && (
        <Card
          classes={{
            children: 'space-y-2',
            title: 'flex items-center gap-2 text-base',
            root: '!p-4',
          }}
          title={
            <>
              <AlertCircle className="h-4 w-4" />
              Writing Tips
            </>
          }
        >
          {assignment.tips.map((tip, index) => (
            <div className="flex items-start gap-2 text-sm" key={index}>
              <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default EssayEditorOverview;
