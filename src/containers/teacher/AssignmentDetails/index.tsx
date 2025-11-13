import React, { useMemo } from 'react';

import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';
import { useQuery } from 'react-query';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import ErrorMessage from 'components/display/ErrorMessage';
import Loading from 'components/display/Loading';

import AssignmentSubmissionListing from 'containers/teacher/AssignmentDetails/AssignmentSubmissionListing';

import { apiViewAssignment } from 'api/assignment';
import tuple from 'utils/types/tuple';

interface ViewAssignmentProps {
  assignmentId: number;
}

function AssignmentDetails({ assignmentId }: ViewAssignmentProps) {
  const { data: assignment, isLoading } = useQuery(
    tuple([apiViewAssignment.queryKey, assignmentId]),
    apiViewAssignment,
  );

  const wordRequiementText = useMemo(() => {
    if (!assignment?.requirements) {
      return;
    }
    if (
      assignment.requirements.min_word_count &&
      assignment.requirements.max_word_count
    ) {
      return `${assignment.requirements.min_word_count} - ${assignment.requirements.max_word_count} words`;
    }
    if (assignment.requirements.min_word_count) {
      return `>${assignment.requirements.min_word_count} words`;
    }
    if (assignment.requirements.max_word_count) {
      return `<${assignment.requirements.max_word_count} words`;
    }
    return 'N/A';
  }, [assignment]);

  const totalPoints = useMemo(() => {
    if (!assignment?.rubrics) {
      return;
    }
    return assignment.rubrics.reduce(
      (acc, rubric) => acc + rubric.max_points,
      0,
    );
  }, [assignment]);

  if (isLoading) {
    return <Loading />;
  }

  if (!assignment) {
    return <ErrorMessage error="System error. Failed to get assignment." />;
  }

  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <Card
        classes={{ children: 'space-y-6', title: '-mb-2', description: 'mb-4' }}
        description={assignment.description}
        title={assignment.title}
      >
        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Essay Type</p>
            <p className="font-medium capitalize">{assignment.type}</p>
          </div>
          {!!assignment.start_date && (
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {dayjs(assignment.start_date).format('MMM D, YYYY')}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {dayjs(assignment.due_date).format('MMM D, YYYY')}
            </p>
          </div>
        </div>

        <Divider />

        {/* Essay Prompt */}
        {/* <div>
          <h3 className="font-medium mb-2">Essay Prompt</h3>
          <p className="text-muted-foreground">{assignment.prompt}</p>
        </div> */}

        {/* Requirements */}
        <div className="flex">
          {assignment.instructions && (
            <div className="basis-1/2">
              <h3 className="font-medium mb-3">Instructions</h3>
              <p className="text-muted-foreground">{assignment.instructions}</p>
            </div>
          )}
          <div className="basis-1/2">
            <h3 className="font-medium mb-3">Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Word Count</p>
                <p className="font-medium">{wordRequiementText}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="font-medium">
                  {totalPoints ? `${totalPoints} points` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Grading Rubric */}
        {assignment.rubrics && (
          <div>
            <h3 className="font-medium mb-3">Grading Rubric</h3>
            <div className="space-y-2">
              {assignment.rubrics.map((item, index) => (
                <div
                  className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
                  key={index}
                >
                  <span>{item.criteria}</span>
                  <span className="font-medium">{item.max_points} points</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <AssignmentSubmissionListing assignmentId={assignmentId} />
    </div>
  );
}

export default AssignmentDetails;
