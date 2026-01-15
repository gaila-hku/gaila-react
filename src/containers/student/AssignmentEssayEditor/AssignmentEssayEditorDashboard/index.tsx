import React, { useCallback, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import { BarChart3, Lightbulb } from 'lucide-react';
import { useMutation, useQuery } from 'react-query';

import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Clickable from 'components/input/Clickable';

import DashboardAgentUsage from 'containers/common/Dashboard/DashboardAgentUsage';
import DashboardAnalyticsSummary from 'containers/common/Dashboard/DashboardAnalyticsSummary';
import DashboardInsights from 'containers/common/Dashboard/DashboardInsights';
import DashboardPlagiarismDetector from 'containers/common/Dashboard/DashboardPlagiarismDetector';
import DashboardPromptChart from 'containers/common/Dashboard/DashboardPromptChart';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGetAssignmentStudentAnalytics } from 'api/assignment';
import { apiSaveTraceData } from 'api/trace-data';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
};

const DASHBOARD_SECTIONS = [
  { key: 'performance', label: 'Performance metrics' },
  { key: 'agent_usage', label: 'Agent Usage' },
  {
    key: 'copying_detector',
    label: 'ChatGPT Copying Detector',
  },
  { key: 'prompt_category', label: 'Prompt Categories' },
  { key: 'writing_insights', label: 'Writing Insights' },
];

const AssignmentEssayEditorDashboard = ({ assignmentId }: Props) => {
  const { assignment } = useAssignmentSubmissionProvider();
  const { essay, assignmentProgress, currentStage, goalContent } =
    useAssignmentEssayEditorProvider();
  const { mutateAsync: saveTraceData } = useMutation(apiSaveTraceData);
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery(
    tuple([apiGetAssignmentStudentAnalytics.queryKey, assignmentId]),
    apiGetAssignmentStudentAnalytics,
  );

  const [activeDashboard, setActiveDashboard] = useState('performance');
  const [dashboardSections, setDashboardSections] =
    useState<{ key: string; label: string }[]>(DASHBOARD_SECTIONS);

  useEffect(() => {
    if (!assignment?.config?.dashboard) {
      return;
    }

    const enabledSections = Object.entries(assignment.config.dashboard)
      .filter(([_, value]) => !!value)
      .map(([key]) => key);

    if (
      enabledSections.includes('prompt_category_nature') ||
      enabledSections.includes('prompt_category_aspect')
    ) {
      enabledSections.push('prompt_category');
    }
    if (
      enabledSections.includes('word_count') ||
      enabledSections.includes('goal_progress') ||
      enabledSections.includes('complexity_scores') ||
      enabledSections.includes('accuracy_scores')
    ) {
      enabledSections.push('performance');
    }

    const filteredSections = DASHBOARD_SECTIONS.filter(section =>
      enabledSections.includes(section.key),
    );
    setDashboardSections(filteredSections);
    setActiveDashboard(filteredSections[0].key);
  }, [assignment]);

  const onSwitchTab = useCallback(
    (key: (typeof DASHBOARD_SECTIONS)[number]['key']) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }
      setActiveDashboard(key);
      saveTraceData({
        assignment_id: assignmentProgress.assignment.id || null,
        stage_id: currentStage.id || null,
        action: 'SWITCH_DASHBOARD_MENU',
        content: JSON.stringify({ tab: key }),
      });
    },
    [assignmentProgress, currentStage, saveTraceData],
  );

  const dashboardComponent = useMemo(() => {
    if (error || !analytics || !assignment || !assignmentProgress) {
      return <ErrorComponent error={error || 'Failed to get analytics'} />;
    }

    switch (activeDashboard) {
      case 'performance':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardAnalyticsSummary
              assignment={assignmentProgress.assignment}
              enabledFlags={assignment?.config?.dashboard}
              essay={essay}
              goalContent={goalContent}
              promptAnalytics={analytics.prompt_data}
            />
          </div>
        );
      case 'agent_usage':
        return (
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
        );
      case 'copying_detector':
        return (
          <DashboardPlagiarismDetector
            essay={essay}
            plagiarisedSegments={analytics.plagiarised_segments}
          />
        );
      case 'prompt_category':
        return (
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
              assignmentId={assignment.id}
              promptData={analytics.prompt_data}
              showAspect={assignment.config?.dashboard?.prompt_category_aspect}
              showHistory
            />
          </Card>
        );
      case 'writing_insights':
        return (
          <DashboardInsights
            analytics={analytics}
            assignmentProgress={assignmentProgress}
            essay={essay}
            goalContent={goalContent}
          />
        );
      default:
        return null;
    }
  }, [
    activeDashboard,
    analytics,
    assignment,
    assignmentProgress,
    error,
    essay,
    goalContent,
  ]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex">
      <div className="flex-[0_0_220px] border-r mr-4 h-fit min-h-[400px] relative">
        {dashboardSections.map(section => (
          <Clickable
            className={clsx(
              'text-muted-foreground py-2 text-sm ml-2',
              'transition-all duration-300 ease-out',
              'hover:text-primary',
              section.key === activeDashboard && 'text-primary',
            )}
            key={section.key}
            onClick={() => onSwitchTab(section.key)}
          >
            {section.label}
          </Clickable>
        ))}
        <div
          className={clsx(
            'absolute left-0 bg-primary h-[36px] w-[2px] rounded-xl',
            'transition-all duration-300 ease-out',
          )}
          style={{
            top:
              dashboardSections.findIndex(
                section => section.key === activeDashboard,
              ) * 36,
          }}
        />
      </div>

      <div className="flex-1">{dashboardComponent}</div>
    </div>
  );
};

export default AssignmentEssayEditorDashboard;
