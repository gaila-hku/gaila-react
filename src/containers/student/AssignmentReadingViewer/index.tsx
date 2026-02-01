import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Sparkles,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import {
  getIndicesFromRange,
  highlightAnnotation,
} from 'containers/student/AssignmentReadingViewer/utils';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentReadingContent,
  AssignmentStageReading,
} from 'types/assignment';

type Annotation = AssignmentReadingContent['annotations'][number];

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

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({
    top: 0,
    left: 0,
    placement: 'below',
  });

  const [annotationNote, setAnnotationNote] = useState('');
  const [selectedColor, setSelectedColor] = useState('#fef08a'); // yellow
  const [selectionIndices, setSelectionIndices] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const highlightColors = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Purple', value: '#e9d5ff' },
  ];

  // Init annotations from submission
  useEffect(() => {
    if (currentStage?.submission?.content) {
      const content = currentStage.submission
        .content as AssignmentReadingContent;
      setAnnotations(content.annotations || []);
      setModelTextGenerated(content.model_text_generated || false);
    }
  }, [currentStage]);

  const currentTextAnnotations = useMemo(() => {
    return annotations.filter(
      annotation => annotation.text_index == currentTextIndex,
    );
  }, [annotations, currentTextIndex]);

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

  const rebuildHighlights = useCallback(() => {
    if (!textContainerRef.current) return;

    const container = textContainerRef.current;

    // Clear existing highlights
    const existingHighlights = container.querySelectorAll(
      '.annotation-highlight',
    );
    existingHighlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight);
      }
    });

    // Rebuild highlights from annotations
    currentTextAnnotations.forEach(annotation => {
      highlightAnnotation(annotation, container);
    });
  }, [currentTextAnnotations]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length == 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedStr = selection.toString().trim();

    if (textContainerRef.current?.contains(range.commonAncestorContainer)) {
      const indices = getIndicesFromRange(range, textContainerRef.current);
      setSelectedText(selectedStr);
      setSelectionIndices(indices);
      setShowAnnotationDialog(true);
      const rect = range.getBoundingClientRect();
      const containerRect = textContainerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const top = rect.top - containerRect.top;
        const left = rect.left - containerRect.left;
        const placement = top < containerRect.height / 2 ? 'above' : 'below';
        setDialogPosition({ top, left, placement });
      }
    }
  }, []);

  useEffect(() => {
    rebuildHighlights();
  }, [currentTextIndex, rebuildHighlights]);

  const saveAnnotations = useCallback(
    (inputAnnotations: Annotation[], isFinal: boolean) => {
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
        is_final: currentStage.submission?.is_final || false,
        changeStage: isFinal,
      });
    },
    [assignment, currentStage, modelTextGenerated, saveSubmission],
  );

  const handleAddAnnotation = useCallback(() => {
    if (selectedText && selectionIndices) {
      const newAnnotation: Annotation = {
        id: dayjs().valueOf(),
        text: selectedText,
        note: annotationNote,
        color: selectedColor,
        start_index: selectionIndices.start,
        end_index: selectionIndices.end,
        text_index: currentTextIndex,
      };

      const newAnnotations = [...annotations, newAnnotation];
      setAnnotations(newAnnotations);
      saveAnnotations(newAnnotations, false);

      setSelectedText('');
      setAnnotationNote('');
      setShowAnnotationDialog(false);
      setSelectionIndices(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [
    annotationNote,
    annotations,
    currentTextIndex,
    saveAnnotations,
    selectedColor,
    selectedText,
    selectionIndices,
  ]);

  const handleDeleteAnnotation = useCallback(
    (id: number) => {
      const updatedAnnotations = annotations.filter(a => a.id !== id);
      setAnnotations(updatedAnnotations);
      saveAnnotations(updatedAnnotations, false);
    },
    [annotations, saveAnnotations],
  );

  const handleCancelAnnotation = useCallback(() => {
    setShowAnnotationDialog(false);
    setSelectedText('');
    setAnnotationNote('');
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleTextSelection, 100);
    };

    // Add both mouse and touch event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleTextSelection]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">Reading</h1>
        <p className="text-muted-foreground mb-4">
          Read and analyze the model text to understand the genre and structure
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
                        key={color.value}
                        style={{ backgroundColor: color.value }}
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

                  <div className="max-h-[500px] pr-4 overflow-auto whitespace-pre-line">
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
            <Card
              className="sticky top-[90px]"
              classes={{
                title: 'flex items-center gap-2',
                description: '-mt-2 mb-2',
              }}
              description={`${currentTextAnnotations.length} note${currentTextAnnotations.length === 1 ? '' : 's'} added`}
              title={
                <>
                  <StickyNote className="h-5 w-5 text-primary" />
                  My Annotations
                </>
              }
            >
              <div className="h-[calc(100vh-360px)] pr-4 overflow-auto">
                {currentTextAnnotations.length === 0 ? (
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
                    {currentTextAnnotations.map(annotation => (
                      <Card
                        className="border-l-4 !p-4"
                        key={annotation.id}
                        style={{ borderLeftColor: annotation.color }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium italic text-muted-foreground line-clamp-2">
                              &quot;{annotation.text}&quot;
                            </p>
                            {annotation.note && (
                              <>
                                <Divider className="!my-2" />
                                <p className="text-sm">{annotation.note}</p>
                              </>
                            )}
                          </div>
                          <Button
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() =>
                              handleDeleteAnnotation(annotation.id)
                            }
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

              {modelTextGenerated && (
                <>
                  <Divider className="my-4" />
                  <Button
                    className="w-full gap-2"
                    onClick={() => saveAnnotations(annotations, true)}
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Continue to Next Stage
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Annotation Dialog */}
      {showAnnotationDialog && (
        <div
          className={clsx(
            'absolute w-[400px]',
            'bg-white border-4 p-4 rounded-lg flex flex-col gap-4',
          )}
          style={{
            top:
              dialogPosition.placement === 'below'
                ? `${dialogPosition.top + 390}px`
                : `${dialogPosition.top + 90}px`,
            left: `${Math.max(20, Math.min(dialogPosition.left, window.innerWidth - 420))}px`,
          }}
        >
          <div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Highlight Color
                </label>
                <div className="flex gap-2">
                  {highlightColors.map(color => (
                    <button
                      className={`w-10 h-10 rounded border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-primary ring-2 ring-primary/20 scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <Clickable onClick={handleCancelAnnotation}>
                <X />
              </Clickable>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Add Note (Optional)
            </label>
            <TextInput
              multiline
              onChange={e => setAnnotationNote(e.target.value)}
              placeholder="Why is this passage important? What did you notice about the structure or language?"
              rows={2}
              value={annotationNote}
            />
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleCancelAnnotation}
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="flex-1 gap-2" onClick={handleAddAnnotation}>
              <Highlighter className="h-4 w-4" />
              Add Annotation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentReadingViewer;
