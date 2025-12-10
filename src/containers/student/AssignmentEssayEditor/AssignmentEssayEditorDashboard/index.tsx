import React from 'react';

import { useQuery } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import DashboardActivity from 'containers/common/Dashboard/DashboardActivity';
import DashboardAnalyticsSummary from 'containers/common/Dashboard/DashboardAnalyticsSummary';
import DashboardInsights from 'containers/common/Dashboard/DashboardInsights';
import DashboardPlagiarismDetector from 'containers/common/Dashboard/DashboardPlagiarismDetector';
import DashboardPromptChart from 'containers/common/Dashboard/DashboardPromptChart';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiGetAssignmentStudentAnalytics } from 'api/assignment';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
};

const AssignmentEssayEditorDashboard = ({ assignmentId }: Props) => {
  const {
    getEssayContent,
    getEssayWordCount,
    assignmentProgress,
    goalContent,
  } = useAssignmentEssayEditorProvider();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery(
    tuple([apiGetAssignmentStudentAnalytics.queryKey, assignmentId]),
    apiGetAssignmentStudentAnalytics,
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error || !analytics || !assignmentProgress) {
    return <ErrorComponent error={error || 'Failed to get analytics'} />;
  }

  // TODO: switch to sidebar menu layout
  return (
    <div className="space-y-6">
      <DashboardAnalyticsSummary
        assignment={assignmentProgress.assignment}
        getEssayWordCount={getEssayWordCount}
        goalContent={goalContent}
        promptAnalytics={analytics.prompt_data}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPlagiarismDetector
          getEssayContent={getEssayContent}
          plagiarisedSegments={analytics.plagiarised_segments}
        />
        <DashboardPromptChart promptAnalytics={analytics.prompt_data} />
        <DashboardActivity analytics={analytics} />
        <DashboardInsights
          analytics={analytics}
          assignmentProgress={assignmentProgress}
          getEssayWordCount={getEssayWordCount}
          goalContent={goalContent}
        />
      </div>
    </div>
  );
};

export default AssignmentEssayEditorDashboard;
