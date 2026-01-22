import React, { useCallback, useMemo } from 'react';

import { isNumber } from 'lodash-es';
import { Calendar, Edit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

import type { TeacherAssignmentListingItem } from 'types/assignment';
import shortenString from 'utils/helper/shortenString';

type Props = {
  assignment: TeacherAssignmentListingItem;
};

const AssignmentCard = ({ assignment }: Props) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: TeacherAssignmentListingItem['status']) => {
    if (status === 'active') return <Badge variant="primary">Active</Badge>;
    if (status === 'upcoming')
      return <Badge variant="secondary">Upcoming</Badge>;
    return <Badge variant="outline">Past Due</Badge>;
  };

  const getProgressPercentage = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  const onViewAssignment = useCallback(
    (id: number) => {
      navigate(pathnames.assignmentView(String(id)));
    },
    [navigate],
  );

  const onEditAssignment = useCallback(
    (id: number) => {
      navigate(pathnames.assignmentEditDetails(String(id)));
    },
    [navigate],
  );

  const maxScore = useMemo(() => {
    if (!assignment.rubrics) return null;
    return assignment.rubrics.reduce(
      (acc, rubric) => acc + rubric.max_points,
      0,
    );
  }, [assignment.rubrics]);

  return (
    <Card
      classes={{
        root: 'hover:shadow-md transition-shadow h-fit',
        children: 'space-y-4',
      }}
      description={
        <>
          {getStatusBadge(assignment.status)}
          <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {shortenString(assignment.description, 100)}
          </div>
        </>
      }
      title={assignment.title}
    >
      {isNumber(assignment.due_date) ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
        </div>
      ) : (
        <></>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Submissions</span>
          <span className="font-medium">
            {assignment.submitted_count}/{assignment.student_count} (
            {getProgressPercentage(
              assignment.submitted_count,
              assignment.student_count,
            )}
            %)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${getProgressPercentage(assignment.submitted_count, assignment.student_count)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Graded</p>
          <p className="text-sm font-medium">
            {assignment.graded_count}/{assignment.student_count}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Avg Score</p>
          <p className="text-sm font-medium">
            {isNumber(assignment.avg_score)
              ? `${assignment.avg_score}${maxScore ? `/${maxScore}` : ''}`
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          className="flex-1 gap-1"
          onClick={() => onViewAssignment(assignment.id)}
          size="sm"
          variant="outline"
        >
          <FileText className="h-3 w-3" />
          View
        </Button>
        <Button
          onClick={() => onEditAssignment(assignment.id)}
          size="sm"
          variant="ghost"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default AssignmentCard;
