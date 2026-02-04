import React, { useMemo } from 'react';

import { StickyNote, Trash2 } from 'lucide-react';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Button from 'components/input/Button';
import Tabs from 'components/navigation/Tabs';

import AIChatBox from 'containers/common/AIChatBox';
import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import { getAnnotationBackgroundColor } from 'containers/student/AssignmentReadingViewer/utils';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentReadingContent } from 'types/assignment';

type Annotation = AssignmentReadingContent['annotations'][number];

type Props = {
  annotations: Annotation[];
  handleDeleteAnnotation: (id: number) => void;
  currentReading: string;
};

const AssignmentReadingViewerSidebar = ({
  annotations,
  handleDeleteAnnotation,
  currentReading,
}: Props) => {
  const { currentStage } = useAssignmentSubmissionProvider();

  const generalChatTool = currentStage?.tools.find(tool => {
    return tool.key === 'reading_general' && tool.enabled;
  });

  const tabs = useMemo(() => {
    const tabs = [
      {
        key: 'annotations',
        title: 'Annotations',
        content: (
          <Card
            classes={{
              title: 'flex items-center gap-2',
              description: '-mt-2 mb-2',
            }}
            description={`${annotations.length} note${annotations.length === 1 ? '' : 's'} added`}
            title={
              <>
                <StickyNote className="h-5 w-5 text-primary" />
                My Annotations
              </>
            }
          >
            <div className="h-[calc(100vh-388px)] pr-4 overflow-auto">
              {annotations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <StickyNote className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No annotations yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select text to add highlights and notes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {annotations.map(annotation => (
                    <Card
                      className="border-l-4 !p-4"
                      key={annotation.id}
                      style={{
                        borderLeftColor: getAnnotationBackgroundColor(
                          annotation.color,
                        ),
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium italic text-muted-foreground line-clamp-2">
                            &quot;{annotation.text}&quot;
                          </p>
                          {(annotation.label || annotation.note) && (
                            <Divider className="!my-2" />
                          )}
                          {annotation.label && (
                            <p className="text-sm">{annotation.label}</p>
                          )}
                          {annotation.note && (
                            <p className="text-sm">{annotation.note}</p>
                          )}
                        </div>
                        <Button
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ),
      },
    ];
    if (generalChatTool) {
      tabs.push({
        key: 'general_chat',
        title: 'AI Chat',
        content: (
          <div>
            <AIChatBoxProvider
              firstMessage="Ask me about your reading, or specific writing sturctures!"
              reading={currentReading}
              toolId={generalChatTool.id}
            >
              <AIChatBox
                chatName="Reading Assistant"
                className="!h-[calc(100vh-280px)]"
                description="Ask me anything about reading material"
              />
            </AIChatBoxProvider>
          </div>
        ),
      });
    }
    return tabs;
  }, [annotations, currentReading, generalChatTool, handleDeleteAnnotation]);

  return <Tabs tabs={tabs} />;
};

export default AssignmentReadingViewerSidebar;
