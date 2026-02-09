import React, { useCallback, useMemo } from 'react';

import { Info, StickyNote, Trash2 } from 'lucide-react';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Button from 'components/input/Button';
import CheckboxInput from 'components/input/CheckboxInput';
import Tabs from 'components/navigation/Tabs';

import AIChatBox from 'containers/common/AIChatBox';
import { getAnnotationBackgroundColor } from 'containers/common/Annotation/utils';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentLanguagePreparationContent,
  LanguageStageAnnotationItem,
} from 'types/assignment';

type Props = {
  annotations: LanguageStageAnnotationItem[];
  handleDeleteAnnotation: (id: number) => void;
};

const AssignmentLanguageViewerSidebar = ({
  annotations,
  handleDeleteAnnotation,
}: Props) => {
  const { assignment, currentStage, saveSubmission } =
    useAssignmentSubmissionProvider();

  const generalChatTool = currentStage?.tools.find(tool => {
    return tool.key === 'language_general' && tool.enabled;
  });

  const onToggleAnnotation = useCallback(
    (item: LanguageStageAnnotationItem) => {
      if (!assignment || !currentStage) {
        return;
      }
      const newAnnotations = annotations.map(annotation => {
        if (annotation.id === item.id) {
          return { ...annotation, will_be_used: !annotation.will_be_used };
        }
        return annotation;
      });
      saveSubmission({
        assignment_id: assignment.id,
        stage_id: currentStage.id,
        content: {
          annotations: newAnnotations,
          generated_vocabs:
            (
              currentStage.submission
                ?.content as AssignmentLanguagePreparationContent
            )?.generated_vocabs || [],
        },
        is_final: currentStage.submission?.is_final || false,
        refetchProgress: true,
      });
    },
    [annotations, assignment, currentStage, saveSubmission],
  );

  const tabs = useMemo(() => {
    const tabs = [
      {
        key: 'annotations',
        title: 'Annotations',
        content: (
          <Card
            classes={{ title: 'flex items-center gap-2' }}
            title={
              <>
                <StickyNote className="h-5 w-5 text-primary" />
                My Annotations
              </>
            }
          >
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-4 flex gap-3 items-start">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Use the check buttons to mark phrases you intend to use.
              </p>
            </div>
            <div className="h-[calc(100vh-440px)] pr-4 overflow-auto">
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
                        <CheckboxInput
                          defaultValue={
                            annotation.will_be_used
                              ? [String(annotation.id)]
                              : []
                          }
                          onChange={() => onToggleAnnotation(annotation)}
                          options={[{ key: String(annotation.id), label: '' }]}
                        />
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
          <AIChatBox
            chatName="Reading Assistant"
            className="!h-[calc(100vh-294px)]"
            description="Ask me anything about reading material"
          />
        ),
      });
    }
    return tabs;
  }, [
    annotations,
    generalChatTool,
    handleDeleteAnnotation,
    onToggleAnnotation,
  ]);

  if (tabs.length === 1) {
    return tabs[0].content;
  }

  return <Tabs tabs={tabs} />;
};

export default AssignmentLanguageViewerSidebar;
