import React from 'react';

import { BarChart3, PenTool } from 'lucide-react';

import Tabs from 'components/navigation/Tabs';

import AssignmentEssayEditorMain from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain';

const AssignmentEssayEditor = () => {
  return (
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
          content: <></>,
        },
      ]}
    />
  );
};

export default AssignmentEssayEditor;
