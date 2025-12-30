import React, { useCallback } from 'react';

import { BarChart3, PenTool } from 'lucide-react';
import { useMutation } from 'react-query';

import Tabs from 'components/navigation/Tabs';

import AssignmentEssayEditorDashboard from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorDashboard';
import AssignmentEssayEditorMain from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain';
import AssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiSaveTraceData } from 'api/trace-data';

const AssignmentEssayEditor = () => {
  const { assignmentProgress, currentStage, assignment } =
    useAssignmentSubmissionProvider();
  const { mutateAsync: saveTraceData } = useMutation(apiSaveTraceData);

  const onSwitchTab = useCallback(
    (key: string) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }
      saveTraceData({
        assignment_id: assignmentProgress.assignment.id || null,
        stage_id: currentStage.id || null,
        action: 'SWITCH_ESSAY_TAB',
        content: JSON.stringify({ tab: key }),
      });
    },
    [assignmentProgress, currentStage, saveTraceData],
  );

  if (!assignmentProgress) {
    return <></>;
  }

  if (!assignment?.config?.dashboard?.enabled) {
    return (
      <AssignmentEssayEditorProvider>
        <AssignmentEssayEditorMain />
      </AssignmentEssayEditorProvider>
    );
  }

  return (
    <AssignmentEssayEditorProvider>
      <Tabs
        classes={{
          panel: 'mt-2',
          tabListWrapper:
            '!sticky top-[64px] z-10 -mx-6 px-6 -mt-4 pt-4 -mb-2 pb-2',
          tab: '!h-10',
          indicator: '!h-8',
        }}
        onClick={onSwitchTab}
        tabs={[
          {
            key: 'editor',
            title: (
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4" /> Essay Editor
              </div>
            ),
            content: <AssignmentEssayEditorMain />,
          },
          {
            key: 'dashboard',
            title: (
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Dashboard
              </div>
            ),
            content: (
              <AssignmentEssayEditorDashboard
                assignmentId={assignmentProgress?.assignment?.id}
              />
            ),
          },
        ]}
      />
    </AssignmentEssayEditorProvider>
  );
};

export default AssignmentEssayEditor;
