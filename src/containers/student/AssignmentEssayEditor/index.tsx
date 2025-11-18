import React, { useCallback } from 'react';

import { BarChart3, PenTool } from 'lucide-react';
import { useMutation } from 'react-query';

import Tabs from 'components/navigation/Tabs';

import AssignmentEssayEditorAnalytics from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics';
import AssignmentEssayEditorMain from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain';
import AssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiSaveTraceData } from 'api/trace-data';

const AssignmentEssayEditor = () => {
  const { assignmentProgress, currentStage } =
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

  return (
    <AssignmentEssayEditorProvider>
      <Tabs
        classes={{
          panel: 'mt-4',
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
            key: 'analytics',
            title: (
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Analytics
              </div>
            ),
            content: <AssignmentEssayEditorAnalytics />,
          },
        ]}
      />
    </AssignmentEssayEditorProvider>
  );
};

export default AssignmentEssayEditor;
