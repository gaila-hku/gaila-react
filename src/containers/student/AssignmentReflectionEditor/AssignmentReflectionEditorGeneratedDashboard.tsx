import React, { useCallback, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import { BarChart3, BookOpen, CheckCheck } from 'lucide-react';
import { useMutation, useQuery } from 'react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGenerateDashboard, apiGetLatestSturcturedGptLog } from 'api/gpt';
import { apiSaveTraceData } from 'api/trace-data';
import type { DashboardGenerateResult } from 'types/gpt';
import tuple from 'utils/types/tuple';

const DASHBOARD_SECTIONS = [
  { key: 'overall', label: 'Overall Analytics' },
  { key: 'annotations', label: 'Annotations (Reading)' },
  { key: 'outline', label: 'Outline points' },
  { key: 'vocabulary', label: 'Vocabulary (Language Prep)' },
  { key: 'checklist', label: 'Checklist Items' },
];

const AssignmentReflectionEditorGeneratedDashboard = () => {
  const { assignmentProgress, currentStage } =
    useAssignmentSubmissionProvider();
  const dashboardGenerateTool = currentStage?.tools.find(
    t => t.key === 'reflection_dashboard_generate',
  );

  const [dashboardData, setDashboardData] = useState<DashboardGenerateResult>();
  const [activeDashboard, setActiveDashboard] = useState('overall');

  const {
    data: latestGenerateData,
    isLoading: isDataLoading,
    error: dataError,
  } = useQuery(
    tuple([
      apiGetLatestSturcturedGptLog.queryKey,
      { assignment_tool_ids: [dashboardGenerateTool?.id || -1] },
    ]),
    apiGetLatestSturcturedGptLog,
    { enabled: !!dashboardGenerateTool },
  );
  const {
    mutate: generateData,
    isLoading: isGenerating,
    error: generateError,
  } = useMutation(apiGenerateDashboard, {
    onSuccess: res => {
      try {
        const newDashboardData = JSON.parse(
          res.gpt_log.gpt_answer,
        ) as DashboardGenerateResult;
        setDashboardData(newDashboardData);
      } catch (e) {
        console.error(e);
      }
    },
  });
  const { mutate: saveTraceData } = useMutation(apiSaveTraceData);

  useEffect(() => {
    if (latestGenerateData?.[0]) {
      setDashboardData(JSON.parse(latestGenerateData[0].gpt_answer));
    }
  }, [latestGenerateData]);

  const handleGenerate = useCallback(() => {
    if (!dashboardGenerateTool) {
      return;
    }
    generateData({ assignment_tool_id: dashboardGenerateTool.id });
  }, [dashboardGenerateTool, generateData]);

  const dashboardComponent = useMemo(() => {
    if (!dashboardData || !assignmentProgress) {
      return null;
    }

    const readingData = dashboardData.reading;
    const usedAnnotaions = readingData.annotations.filter(a => a.referenced);
    const outlineData = dashboardData.outline;
    const usedOutlinePoints = outlineData.outline_points.filter(
      a => a.referenced,
    );
    const vocabData = dashboardData.language;
    const usedVocabs = vocabData.vocabs.filter(a => a.referenced);
    const checklistData = dashboardData.checklist;
    const usedChecklistItems = checklistData.checklist_items.filter(
      a => a.referenced,
    );

    const chartData = [
      {
        name: 'Annotations',
        'Referenced/Completed': usedAnnotaions.length,
        'Unused/Incomplete':
          readingData.annotations.length - usedAnnotaions.length,
      },
      {
        name: 'Outline',
        'Referenced/Completed': usedOutlinePoints.length,
        'Unused/Incomplete':
          outlineData.outline_points.length - usedOutlinePoints.length,
      },
      {
        name: 'Vocabulary',
        'Referenced/Completed': usedVocabs.length,
        'Unused/Incomplete': vocabData.vocabs.length - usedVocabs.length,
      },
      {
        name: 'Checklist',
        'Referenced/Completed': usedChecklistItems.length,
        'Unused/Incomplete':
          checklistData.checklist_items.length - usedChecklistItems.length,
      },
    ];

    switch (activeDashboard) {
      case 'overall':
        return (
          <>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4" />
              <h3 className="font-semibold text-sm">Overall Analytics</h3>
            </div>
            <ResponsiveContainer height={200} width="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <RechartsTooltip />
                <Bar
                  dataKey="Referenced/Completed"
                  fill="#3b82f6"
                  stackId="a"
                />
                <Bar
                  dataKey="Unused/Incomplete"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  stackId="a"
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-primary text-sm mt-4">
              {dashboardData.overall_suggestion}
            </div>
          </>
        );
      case 'annotations':
        return (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Annotations Referenced</h3>
              <Badge variant="secondary">
                {usedAnnotaions.length}/{readingData.annotations.length} used
              </Badge>
            </div>
            <div className="text-primary text-sm my-4">
              {readingData.suggestions}
            </div>
            <div className="space-y-2">
              {readingData.annotations.map((item, index) => (
                <Card
                  className={clsx([
                    'border-l-4 !p-4',
                    item.referenced ? 'border-l-green-500' : 'border-l-muted',
                  ])}
                  key={`used-annotation-${index}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {item.referenced ? (
                      <CheckCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm italic">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        );
      case 'outline':
        return (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">
                Outline Points Referenced
              </h3>
              <Badge variant="secondary">
                {usedOutlinePoints.length}/{outlineData.outline_points.length}{' '}
                used
              </Badge>
            </div>
            <div className="text-primary text-sm my-4">
              {outlineData.suggestions}
            </div>
            <div className="space-y-2">
              {outlineData.outline_points.map((item, index) => (
                <Card
                  className={clsx([
                    'border-l-4 !p-4',
                    item.referenced ? 'border-l-green-500' : 'border-l-muted',
                  ])}
                  key={`used-annotation-${index}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {item.referenced ? (
                      <CheckCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm italic">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        );
      case 'vocabulary':
        return (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Vocabularies Referenced</h3>
              <Badge variant="secondary">
                {usedVocabs.length}/{vocabData.vocabs.length} used
              </Badge>
            </div>
            <div className="text-primary text-sm my-4">
              {vocabData.suggestions}
            </div>
            <div className="space-y-2">
              {vocabData.vocabs.map((item, index) => (
                <Card
                  className={clsx([
                    'border-l-4 !p-4',
                    item.referenced ? 'border-l-green-500' : 'border-l-muted',
                  ])}
                  key={`used-annotation-${index}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {item.referenced ? (
                      <CheckCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm italic">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        );
      case 'checklist':
        return (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">
                Checklist Items Completed
              </h3>
              <Badge variant="secondary">
                {usedChecklistItems.length}/
                {checklistData.checklist_items.length} used
              </Badge>
            </div>
            <div className="text-primary text-sm my-4">
              {checklistData.suggestions}
            </div>
            <div className="space-y-2">
              {checklistData.checklist_items.map((item, index) => (
                <Card
                  className={clsx([
                    'border-l-4 !p-4',
                    item.referenced ? 'border-l-green-500' : 'border-l-muted',
                  ])}
                  key={`used-annotation-${index}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {item.referenced ? (
                      <CheckCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm italic">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  }, [activeDashboard, assignmentProgress, dashboardData]);

  const onSwitchTab = useCallback(
    (key: (typeof DASHBOARD_SECTIONS)[number]['key']) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }
      setActiveDashboard(key);
      saveTraceData({
        assignment_id: assignmentProgress.assignment.id || null,
        stage_id: currentStage.id || null,
        action: 'SWITCH_GENERATED_DASHBOARD_MENU',
        content: JSON.stringify({ tab: key }),
      });
    },
    [assignmentProgress, currentStage, saveTraceData],
  );

  if (!dashboardGenerateTool) {
    return <>Analytics not supported for this assignment.</>;
  }

  if (isDataLoading) {
    return <Loading />;
  }

  return (
    <>
      {!!dashboardData && (
        <div className="flex mb-2">
          <div className="flex-[0_0_220px] border-r mr-4 h-fit relative">
            {DASHBOARD_SECTIONS.map(section => (
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
                  DASHBOARD_SECTIONS.findIndex(
                    section => section.key === activeDashboard,
                  ) * 36,
              }}
            />
          </div>

          <div className="flex-1 p-4 h-[calc(100vh-364px)] overflow-auto">
            {dashboardComponent}
          </div>
        </div>
      )}
      <Button
        className={dashboardData ? 'ml-auto' : ''}
        loading={isGenerating}
        onClick={handleGenerate}
      >
        {dashboardData ? 'Regenerate' : 'Generate'} Analytics
      </Button>
      {(!!dataError || !!generateError) && (
        <ErrorComponent error={dataError || generateError} />
      )}
    </>
  );
};

export default AssignmentReflectionEditorGeneratedDashboard;
