import React from 'react';

import { BarChart3, Lightbulb } from 'lucide-react';
import { useQuery } from 'react-query';

import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import DashboardAgentUsage from 'containers/common/Dashboard/DashboardAgentUsage';
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
  const { essay, assignmentProgress, goalContent } =
    useAssignmentEssayEditorProvider();

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardAnalyticsSummary
          assignment={assignmentProgress.assignment}
          essay={essay}
          goalContent={goalContent}
          promptAnalytics={analytics.prompt_data}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPlagiarismDetector
          essay={essay}
          plagiarisedSegments={analytics.plagiarised_segments}
        />
        <Card
          classes={{
            title: 'flex items-center gap-2',
            description: '-mt-2 mb-4',
            root: 'h-fit',
          }}
          description="Analysis of your AI interaction patterns"
          title={
            <>
              <Lightbulb className="h-5 w-5" />
              Prompt Categories
            </>
          }
        >
          <DashboardPromptChart promptData={analytics.prompt_data} />
        </Card>
        <Card
          classes={{ description: '-mt-2 mb-4', root: 'h-fit' }}
          description="How you spend your time in this assignment"
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Agent Usage
            </div>
          }
        >
          <DashboardAgentUsage promptData={analytics.prompt_data} />
        </Card>
        <DashboardInsights
          analytics={analytics}
          assignmentProgress={assignmentProgress}
          essay={essay}
          goalContent={goalContent}
        />
      </div>
    </div>
  );
};

export default AssignmentEssayEditorDashboard;
