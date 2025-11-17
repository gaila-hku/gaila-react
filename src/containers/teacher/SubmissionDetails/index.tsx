import React, { useMemo } from 'react';

import dayjs from 'dayjs';
import { useQuery } from 'react-query';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import SubmissionDetailsAnalytics from 'containers/teacher/SubmissionDetails/SubmissionDetailsAnalytics';
import SubmissionDetailsContent from 'containers/teacher/SubmissionDetails/SubmissionDetailsContent';
import SubmissionDetailsGrading from 'containers/teacher/SubmissionDetails/SubmissionDetailsGrading';
import SubmissionDetailsReminder from 'containers/teacher/SubmissionDetails/SubmissionDetailsReminder';

import { apiViewAssignmentSubmission } from 'api/assignment';
import getStageTypeLabel from 'utils/helper/getStageTypeLabel';
import getUserName from 'utils/helper/getUserName';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
  studentId: number;
};

function SubmissionDetails({ assignmentId, studentId }: Props) {
  const {
    data: submissionDetails,
    isLoading,
    error,
  } = useQuery(
    tuple([apiViewAssignmentSubmission.queryKey, assignmentId, studentId]),
    apiViewAssignmentSubmission,
  );

  const statusBadge = useMemo(() => {
    if (!submissionDetails?.submissions.length) {
      return <></>;
    }

    if (submissionDetails.submissions.find(s => !!s.grade)) {
      return <Badge variant="success">Graded</Badge>;
    }
    const lastSubmittedStage = submissionDetails.stages
      .sort((a, b) => a.order_index - b.order_index)
      .find(
        stage =>
          !!submissionDetails.submissions.find(
            s => s.stage_id === stage.id && s.is_final,
          ),
      );
    if (!lastSubmittedStage) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    return (
      <Badge variant="primary">
        Submitted {getStageTypeLabel(lastSubmittedStage)}
      </Badge>
    );
  }, [submissionDetails]);

  if (isLoading) {
    return <Loading />;
  }

  if (!submissionDetails || error) {
    return <ErrorComponent error={error || 'Failed to load submission'} />;
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <Card
          classes={{
            children: 'space-y-4',
            description: 'flex gap-2 -mt-2 mb-2 text-sm',
          }}
          description={
            <>
              <span>{getUserName(submissionDetails.student)}</span>
              <span>•</span>
              <span>
                Last modified:{' '}
                {dayjs(
                  Math.max(
                    ...submissionDetails.submissions.map(s => s.submitted_at),
                  ),
                ).format('MMM D, YYYY')}
              </span>
            </>
          }
          title={
            <div className="flex items-center justify-between">
              <div>{submissionDetails.assignment.title}</div>
              {statusBadge}
            </div>
          }
        >
          <SubmissionDetailsContent
            stages={submissionDetails.stages}
            submissions={submissionDetails.submissions}
          />
        </Card>

        {/* Student Analytics Card */}
        <SubmissionDetailsAnalytics />
      </div>

      <div className="space-y-6">
        <SubmissionDetailsGrading
          gradingToolId={submissionDetails.teacher_grading_tool_id}
          rubrics={submissionDetails.assignment.rubrics || []}
          submissions={submissionDetails.submissions}
        />
        <SubmissionDetailsReminder />
      </div>
    </div>
  );
}

export default SubmissionDetails;
