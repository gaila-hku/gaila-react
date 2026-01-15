import React, { useMemo } from 'react';

import { BarChart3, Lightbulb } from 'lucide-react';
import { useQuery } from 'react-query';

import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import DashboardAgentUsage from 'containers/common/Dashboard/DashboardAgentUsage';
import DashboardPlagiarismDetector from 'containers/common/Dashboard/DashboardPlagiarismDetector';
import DashboardPromptChart from 'containers/common/Dashboard/DashboardPromptChart';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGetAssignmentStudentAnalytics } from 'api/assignment';
import type {
  AssignmentDraftingContent,
  AssignmentRevisingContent,
} from 'types/assignment';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
};

const AssignmentReflectionEditorDashboard = ({ assignmentId }: Props) => {
  const { assignmentProgress, assignment } = useAssignmentSubmissionProvider();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery(
    tuple([apiGetAssignmentStudentAnalytics.queryKey, assignmentId]),
    apiGetAssignmentStudentAnalytics,
  );

  const essay = useMemo(() => {
    if (!assignmentProgress) {
      return '';
    }
    const reviseSubmission = assignmentProgress.stages.find(
      stage => stage.stage_type === 'revising',
    ) as AssignmentRevisingContent | undefined;
    if (reviseSubmission) {
      return reviseSubmission.essay;
    }
    const draftSubmission = assignmentProgress.stages.find(
      stage => stage.stage_type === 'drafting',
    ) as AssignmentDraftingContent | undefined;
    return draftSubmission?.essay || '';
  }, [assignmentProgress]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !analytics) {
    return <ErrorComponent error={error || 'Failed to get analytics'} />;
  }

  if (!assignmentProgress) {
    return;
  }

  const dashboardConfig = assignment?.config?.dashboard;

  return (
    <div className="space-y-3">
      {dashboardConfig?.agent_usage && (
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
          <DashboardAgentUsage usageData={analytics.agent_usage} />
        </Card>
      )}
      {dashboardConfig?.copying_detector && (
        <DashboardPlagiarismDetector
          essay={essay}
          plagiarisedSegments={analytics.plagiarised_segments}
        />
      )}
      {(dashboardConfig?.prompt_category_nature ||
        dashboardConfig?.prompt_category_aspect) && (
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
          <DashboardPromptChart
            assignmentId={assignmentId}
            promptData={analytics.prompt_data}
            showAspect={dashboardConfig?.prompt_category_aspect}
            showHistory
          />
        </Card>
      )}
    </div>
  );
};

export default AssignmentReflectionEditorDashboard;
