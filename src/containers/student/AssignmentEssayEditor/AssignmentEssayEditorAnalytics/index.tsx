import React from 'react';

import { useQuery } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import AssignmentEssayEditorActivity from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorActivity';
import AssignmentEssayEditorAnalyticsSummary from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorAnalyticsSummary';
import AssignmentEssayEditorInsights from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorInsights';
import AssignmentEssayEditorPlagiarismDetector from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorPlagiarismDetector';
import AssignmentEssayEditorPromptChart from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics/AssignmentEssayEditorPromptChart';

import { apiGetAssignmentAnalytics } from 'api/assignment';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
};

const AssignmentEssayEditorAnalytics = ({ assignmentId }: Props) => {
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery(
    tuple([apiGetAssignmentAnalytics.queryKey, assignmentId]),
    apiGetAssignmentAnalytics,
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error || !analytics) {
    return <ErrorComponent error={error || 'Failed to get analytics'} />;
  }

  return (
    <div className="space-y-6">
      <AssignmentEssayEditorAnalyticsSummary
        promptAnalytics={analytics.prompt_data}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignmentEssayEditorPlagiarismDetector
          plagiarisedSegments={analytics.plagiarised_segments}
        />
        <AssignmentEssayEditorPromptChart
          promptAnalytics={analytics.prompt_data}
        />
        <AssignmentEssayEditorActivity analytics={analytics} />
        <AssignmentEssayEditorInsights analytics={analytics} />
      </div>
    </div>
  );
};

export default AssignmentEssayEditorAnalytics;
