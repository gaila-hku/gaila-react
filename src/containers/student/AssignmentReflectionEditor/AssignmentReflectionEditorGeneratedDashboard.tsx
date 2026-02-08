import React, { useCallback, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { BookOpen, CheckCheck, ClipboardCheck, Languages } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGenerateDashboard, apiGetLatestSturcturedGptLog } from 'api/gpt';
import type { DashboardGenerateResult } from 'types/gpt';
import tuple from 'utils/types/tuple';

const AssignmentReflectionEditorGeneratedDashboard = () => {
  const queryClient = useQueryClient();
  const { currentStage } = useAssignmentSubmissionProvider();
  const dashboardGenerateTool = currentStage?.tools.find(
    t => t.key === 'reflection_dashboard_generate',
  );

  const [dashboardData, setDashboardData] = useState<DashboardGenerateResult>();

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
        queryClient.invalidateQueries([apiGetLatestSturcturedGptLog.queryKey]);
      } catch (e) {
        console.error(e);
      }
    },
  });

  const init = useRef(false);
  useEffect(() => {
    if (latestGenerateData?.[0] && !init.current) {
      setDashboardData(JSON.parse(latestGenerateData[0].gpt_answer));
      init.current = true;
    }
  }, [latestGenerateData]);

  const handleGenerate = useCallback(() => {
    if (!dashboardGenerateTool) {
      return;
    }
    generateData({ assignment_tool_id: dashboardGenerateTool.id });
  }, [dashboardGenerateTool, generateData]);

  if (!dashboardGenerateTool) {
    return <>Analytics not supported for this assignment.</>;
  }

  if (isDataLoading) {
    return <Loading />;
  }

  if (!dashboardData) {
    return (
      <>
        <Button loading={isGenerating} onClick={handleGenerate}>
          Generate Analytics
        </Button>
        <ErrorComponent error={dataError || generateError} />
      </>
    );
  }

  const vocabData = dashboardData.language;
  const usedVocab = vocabData.vocabs.filter(v => v.referenced);
  const checklistData = dashboardData.checklist;
  const usedChecklist = checklistData.checklist_items.filter(v => v.referenced);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card
          classes={{
            title: 'flex items-center gap-2 -mb-2',
            status: '-mb-8 mt-1 bg-muted',
            root: '!p-4',
          }}
          status={`${usedVocab.length}/${vocabData.vocabs.length} used`}
          title={
            <>
              <Languages />
              Vocabularies Referenced
            </>
          }
        >
          <div className="text-primary text-sm my-4 whitespace-pre-wrap">
            {vocabData.suggestions}
          </div>
          <div className="max-h-[calc(100vh-420px)] overflow-auto pr-4 space-y-2">
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
        </Card>
        <Card
          classes={{
            title: 'flex items-center gap-2 -mb-2',
            status: '-mb-8 mt-1 bg-muted',
            root: '!p-4',
          }}
          status={`${usedChecklist.length}/${checklistData.checklist_items.length} used`}
          title={
            <>
              <ClipboardCheck />
              Checklist Items Completed
            </>
          }
        >
          <div className="text-primary text-sm my-4 whitespace-pre-wrap">
            {checklistData.suggestions}
          </div>
          <div className="max-h-[calc(100vh-420px)] overflow-auto pr-4 space-y-2">
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
        </Card>
      </div>
      <Button
        className="ml-auto"
        loading={isGenerating}
        onClick={handleGenerate}
      >
        Regenerate Analytics
      </Button>
      <ErrorComponent error={dataError || generateError} />
    </>
  );
};

export default AssignmentReflectionEditorGeneratedDashboard;
