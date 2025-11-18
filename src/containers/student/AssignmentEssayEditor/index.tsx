import React from 'react';

import { BarChart3, PenTool } from 'lucide-react';

import Tabs from 'components/navigation/Tabs';

import AssignmentEssayEditorAnalytics from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics';
import AssignmentEssayEditorMain from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain';
import AssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider';

const AssignmentEssayEditor = () => {
  return (
    <AssignmentEssayEditorProvider>
      <Tabs
        classes={{
          panel: 'mt-4',
          tab: '!h-10',
          indicator: '!h-8',
        }}
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
