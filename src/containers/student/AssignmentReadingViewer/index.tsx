import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

import useAnnotation from 'containers/common/Annotation/useAnnotation';
import { highlightColors } from 'containers/common/Annotation/utils';
import AssignmentReadingViewerSidebar from 'containers/student/AssignmentReadingViewer/AssignmentReadingViewerSidebar';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AnnotationItem,
  AssignmentReadingContent,
  AssignmentStageReading,
} from 'types/assignment';

const AssignmentReadingViewer = () => {
  const { assignment, currentStage, saveSubmission } =
    useAssignmentSubmissionProvider();

  const readings = useMemo(() => {
    if (!currentStage) {
      return [];
    }
    return (currentStage as AssignmentStageReading).config.readings || [];
  }, [currentStage]);

  const [modelTextGenerated, setModelTextGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStage?.submission?.content) {
      const content = currentStage.submission
        .content as AssignmentReadingContent;
      setModelTextGenerated(content.model_text_generated || false);
    }
  }, [currentStage]);

  const saveAnnotations = useCallback(
    (inputAnnotations: AnnotationItem[], isFinal: boolean) => {
      if (!assignment || !currentStage) {
        return;
      }
      saveSubmission({
        assignment_id: assignment.id,
        stage_id: currentStage.id,
        content: {
          annotations: inputAnnotations,
          model_text_generated: modelTextGenerated,
        },
        is_final: currentStage.submission?.is_final || isFinal,
        changeStage: isFinal,
      });
    },
    [assignment, currentStage, modelTextGenerated, saveSubmission],
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
  });

  const handleGenerateText = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      if (!assignment || !currentStage) {
        return;
      }
      setModelTextGenerated(true);
      setIsGenerating(false);
      saveSubmission({
        assignment_id: assignment.id,
        stage_id: currentStage.id,
        content: { model_text_generated: true, annotations: [] },
        is_final: currentStage.submission?.is_final || false,
      });
    }, 2000);
  }, [assignment, currentStage, saveSubmission]);

  const handlePreviousText = useCallback(() => {
    setCurrentTextIndex(index => {
      if (index == 0) {
        return readings.length - 1;
      }
      return index - 1;
    });
  }, [readings.length]);

  const handleNextText = useCallback(() => {
    setCurrentTextIndex(index => {
      if (index == readings.length - 1) {
        return 0;
      }
      return index + 1;
    });
  }, [readings.length]);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">Reading</h1>
        <p className="text-muted-foreground mb-4">
          Read and analyze the model text to understand the genre structure
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Reading Area */}
          <div className="lg:col-span-2">
            <Card
              classes={{
                title: 'flex items-center gap-2',
                description: '-mt-2 mb-2',
              }}
              description="Highlight important passages and add your notes to analyze the text structure"
              title={
                <>
                  <BookOpen className="h-5 w-5 text-primary" />
                  Model Text for Analysis
                </>
              }
            >
              {modelTextGenerated ? (
                <>
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg border flex items-center gap-2">
                    <p className="text-sm font-medium">How to annotate:</p>
                    <p className="text-xs text-muted-foreground">
                      Select any text to highlight and add notes
                    </p>
                    {highlightColors.map(color => (
                      <div
                        className="w-4 h-4 rounded border border-border"
                        key={color.backgroundColor}
                        style={{ backgroundColor: color.backgroundColor }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">
                      Text {currentTextIndex + 1} of {readings.length}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        className="gap-1"
                        disabled={currentTextIndex === 0}
                        onClick={handlePreviousText}
                        size="sm"
                        variant="outline"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        className="gap-1"
                        disabled={currentTextIndex === readings.length - 1}
                        onClick={handleNextText}
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
                      {readings[currentTextIndex]}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">
                    Click the button above to generate a model text
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mb-4">
                    The AI will create a sample essay that demonstrates the
                    genre and structure you should follow
                  </p>
                  <Button
                    className="gap-2"
                    disabled={isGenerating}
                    onClick={handleGenerateText}
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Model Text'}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Annotations Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[90px]">
              <AssignmentReadingViewerSidebar
                annotations={currentTextAnnotations}
                currentReading={readings[currentTextIndex]}
                handleDeleteAnnotation={handleDeleteAnnotation}
              />

              {modelTextGenerated && (
                <Button
                  className="w-full gap-2 mt-4"
                  onClick={() => saveAnnotations(annotations, true)}
                  size="lg"
                >
                  <CheckCircle className="h-4 w-4" />
                  Continue to Next Stage
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {annotationDialog}
    </div>
  );
};

export default AssignmentReadingViewer;
