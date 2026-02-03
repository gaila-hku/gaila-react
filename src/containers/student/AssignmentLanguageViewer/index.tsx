import React, { useCallback, useMemo } from 'react';

import { Book, CheckCircle, List } from 'lucide-react';

import Button from 'components/input/Button';
import Tabs from 'components/navigation/Tabs';

import AIChatBox from 'containers/common/AIChatBox';
import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import AssignmentLanguageViewerReading from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerReading';
import AssignmentLanguageViewerVocab from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerVocab';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentLanguagePreparationContent,
  AssignmentStageLanguagePreparation,
} from 'types/assignment';

export const AssignmentLanguageViewer = () => {
  const { assignment, currentStage, saveSubmission } =
    useAssignmentSubmissionProvider();

  const vocabEnabled = (currentStage as AssignmentStageLanguagePreparation)
    .config.vocabulary_enabled;

  const generalChatTool = currentStage?.tools.find(tool => {
    return tool.key === 'language_general' && tool.enabled;
  });

  const handleToNextStage = useCallback(() => {
    if (!assignment || !currentStage) {
      return;
    }
    const submissionContent = currentStage.submission?.content as
      | AssignmentLanguagePreparationContent
      | undefined;
    saveSubmission({
      assignment_id: assignment.id,
      stage_id: currentStage.id,
      content: { generated_vocabs: submissionContent?.generated_vocabs || [] },
      is_final: true,
      changeStage: true,
    });
  }, [assignment, currentStage, saveSubmission]);

  const tabs = useMemo(
    () => [
      ...((currentStage as AssignmentStageLanguagePreparation)?.config.readings
        ?.length
        ? [
            {
              key: 'samples',
              title: (
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Sample Texts
                </div>
              ),
              content: (
                <div className="h-[calc(100vh-290px)]">
                  <AssignmentLanguageViewerReading />
                </div>
              ),
            },
          ]
        : []),
      ...(vocabEnabled
        ? [
            {
              key: 'vocabulary',
              title: (
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Vocabulary
                </div>
              ),
              content: (
                <div className="h-[calc(100vh-290px)]">
                  <AssignmentLanguageViewerVocab />
                </div>
              ),
            },
          ]
        : []),
    ],
    [currentStage, vocabEnabled],
  );

  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Language Preparation</h1>
      <p className="text-muted-foreground mb-4">
        Strengthen your language skills with sample texts and vocabulary tools
      </p>

      <AIChatBoxProvider
        firstMessage="Hello! I'm here to help you with language preparation for your essay. I can help you understand vocabulary, provide examples, and discuss language patterns. What would you like to know?"
        toolId={generalChatTool?.id || -1}
      >
        <ResizableSidebar initWidth={500}>
          <div>
            {tabs.length > 1 ? (
              <Tabs className="w-full" tabs={tabs} />
            ) : (
              tabs[0]?.content || <></>
            )}
            <Button
              className="w-full gap-2 mt-4"
              onClick={handleToNextStage}
              size="lg"
            >
              <CheckCircle className="h-4 w-4" />
              Continue to Next Stage
            </Button>
          </div>

          {generalChatTool && (
            <AIChatBox
              chatName="Language Assistant"
              className="!h-[calc(100vh-200px)]"
              description="Ask questions about vocabulary, grammar, and language patterns"
              placeholder="Ask about language..."
            />
          )}
        </ResizableSidebar>
      </AIChatBoxProvider>
    </div>
  );
};

export default AssignmentLanguageViewer;
