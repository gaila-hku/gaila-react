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
import DashboardPlagiarismDetector from 'containers/common/Dashboard/DashboardPlagiarismDetector';
import DashboardPromptChart from 'containers/common/Dashboard/DashboardPromptChart';
import { DASHBOARD_SECTIONS } from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorDashboard';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGetAssignmentStudentAnalytics } from 'api/assignment';
import { apiSaveTraceData } from 'api/trace-data';
import type {
  AssignmentDraftingContent,
  AssignmentGoalContent,
  AssignmentOutliningContent,
  AssignmentRevisingContent,
} from 'types/assignment';
import tuple from 'utils/types/tuple';

type Props = {
  assignmentId: number;
};

const AssignmentReflectionEditorDashboard = ({ assignmentId }: Props) => {
  const { assignmentProgress, assignment, currentStage } =
    useAssignmentSubmissionProvider();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery(
    tuple([apiGetAssignmentStudentAnalytics.queryKey, assignmentId]),
    apiGetAssignmentStudentAnalytics,
  );
  const { mutate: saveTraceData } = useMutation(apiSaveTraceData);

  const goalContent = useMemo(() => {
    if (!assignmentProgress) {
      return null;
    }
    const goalSubmission = assignmentProgress.stages.find(
      stage => stage.stage_type === 'goal_setting',
    )?.submission?.content as AssignmentGoalContent | undefined;
    return goalSubmission || null;
  }, [assignmentProgress]);

  const outline = useMemo(() => {
    if (!assignmentProgress) {
      return '';
    }
    const outlineSubmission = assignmentProgress.stages.find(
      stage => stage.stage_type === 'outlining',
    )?.submission?.content as AssignmentOutliningContent | undefined;
    return outlineSubmission?.outline || '';
  }, [assignmentProgress]);

  const essay = useMemo(() => {
    if (!assignmentProgress) {
      return '';
    }
    const reviseSubmission = assignmentProgress.stages.find(
      stage => stage.stage_type === 'revising',
    )?.submission?.content as AssignmentRevisingContent | undefined;
    if (reviseSubmission) {
      return reviseSubmission.essay;
    }
    const draftSubmission = assignmentProgress.stages.find(
      stage => stage.stage_type === 'drafting',
    )?.submission?.content as AssignmentDraftingContent | undefined;
    return draftSubmission?.essay || '';
  }, [assignmentProgress]);

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

    const filteredSections = DASHBOARD_SECTIONS.filter(
      section =>
        enabledSections.includes(section.key) &&
        section.key !== 'writing_insights',
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
        action: 'SWITCH_DASHBOARD_MENU_REFLECTION',
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            description="Your tools usage in this assignment"
            title={
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tool Usage
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
            essayPlagiarisedSegments={analytics.essay_plagiarised_segments}
            outline={outline}
            outlinePlagiarisedSegments={analytics.outline_plagiarised_segments}
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
                How well did I use AI?
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
    outline,
  ]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !analytics) {
    return <ErrorComponent error={error || 'Failed to get analytics'} />;
  }

  if (!assignmentProgress) {
    return;
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

export default AssignmentReflectionEditorDashboard;
