import React, { useMemo } from 'react';

import { Book, List } from 'lucide-react';

import Card from 'components/display/Card';
import Tabs from 'components/navigation/Tabs';

import AIChatBox from 'containers/common/AIChatBox';
import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import AssignmentLanguageViewerReading from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerReading';
import AssignmentLanguageViewerVocab from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerVocab';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentStageLanguagePreparation } from 'types/assignment';

export const AssignmentLanguageViewer = () => {
  const { currentStage } = useAssignmentSubmissionProvider();

  const vocabEnabled = (currentStage as AssignmentStageLanguagePreparation)
    .config.vocabulary_enabled;

  const generalChatTool = currentStage?.tools.find(tool => {
    return tool.key === 'language_general';
  });

  const tabs = useMemo(
    () => [
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
    [vocabEnabled],
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
            <Card
              classes={{
                title: 'flex items-center gap-2',
                description: '-mt-2 mb-2',
              }}
            >
              <Tabs className="w-full" tabs={tabs} />
            </Card>
          </div>

          {generalChatTool && (
            <AIChatBox
              chatName="Language Assistant"
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
