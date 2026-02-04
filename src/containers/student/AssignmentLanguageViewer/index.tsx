import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  Book,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';

import Badge from 'components/display/Badge';
import Button from 'components/input/Button';
import Tabs from 'components/navigation/Tabs';

import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import useAnnotation from 'containers/common/Annotation/useAnnotation';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import AssignmentLanguageViewerSidebar from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerSidebar';
import AssignmentLanguageViewerVocab from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerVocab';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AnnotationItem,
  AssignmentLanguagePreparationContent,
  AssignmentStageLanguagePreparation,
  LanguageStageAnnotationItem,
} from 'types/assignment';

export const AssignmentLanguageViewer = () => {
  const { assignment, currentStage, saveSubmission } =
    useAssignmentSubmissionProvider();

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const sampleTexts = useMemo(() => {
    if (!currentStage) {
      return [];
    }
    return (
      (currentStage as AssignmentStageLanguagePreparation).config.readings || []
    );
  }, [currentStage]);

  const textContainerRef = useRef<HTMLDivElement>(null);

  const saveAnnotations = useCallback(
    (inputAnnotations: AnnotationItem[], isFinal: boolean) => {
      if (!assignment || !currentStage) {
        return;
      }
      saveSubmission({
        assignment_id: assignment.id,
        stage_id: currentStage.id,
        content: {
          ...(currentStage.submission?.content || { generated_vocabs: [] }),
          annotations: inputAnnotations,
        },
        is_final: currentStage.submission?.is_final || isFinal,
        changeStage: isFinal,
      });
    },
    [assignment, currentStage, saveSubmission],
  );

  const {
    annotations,
    currentTextAnnotations,
    handleDeleteAnnotation,
    annotationDialog,
  } = useAnnotation({
    textContainerRef,
    currentTextIndex,
    saveAnnotations,
    dialogHorizontalOffset: 0,
  });

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
      content: submissionContent || { generated_vocabs: [], annotations },
      is_final: true,
      changeStage: true,
    });
  }, [annotations, assignment, currentStage, saveSubmission]);

  const handleNextSample = useCallback(() => {
    if (currentTextIndex < sampleTexts.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1);
    }
  }, [currentTextIndex, sampleTexts.length]);

  const handlePreviousSample = useCallback(() => {
    if (currentTextIndex > 0) {
      setCurrentTextIndex(currentTextIndex - 1);
    }
  }, [currentTextIndex]);

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
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">
                      Sample {currentTextIndex + 1} of {sampleTexts.length}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        className="gap-1"
                        disabled={currentTextIndex === 0}
                        onClick={handlePreviousSample}
                        size="sm"
                        variant="outline"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        className="gap-1"
                        disabled={currentTextIndex === sampleTexts.length - 1}
                        onClick={handleNextSample}
                        size="sm"
                        variant="outline"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pr-4 whitespace-pre-line">
                    <div className="select-text" ref={textContainerRef}>
                      {sampleTexts[currentTextIndex]}
                    </div>
                  </div>
                  {annotationDialog}
                </>
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
    [
      annotationDialog,
      currentStage,
      currentTextIndex,
      handleNextSample,
      handlePreviousSample,
      sampleTexts,
      vocabEnabled,
    ],
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
          </div>

          <div className="sticky top-[90px]">
            <AssignmentLanguageViewerSidebar
              annotations={
                currentTextAnnotations as LanguageStageAnnotationItem[]
              }
              currentReading={sampleTexts[currentTextIndex]}
              handleDeleteAnnotation={handleDeleteAnnotation}
            />
            <Button
              className="w-full gap-2 mt-4"
              onClick={handleToNextStage}
              size="lg"
            >
              <CheckCircle className="h-4 w-4" />
              Continue to Next Stage
            </Button>
          </div>
        </ResizableSidebar>
      </AIChatBoxProvider>
    </div>
  );
};

export default AssignmentLanguageViewer;
