import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import {
  BookOpen,
  CheckCircle,
  Highlighter,
  Sparkles,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentStageReading } from 'types/assignment';

interface Annotation {
  id: string;
  text: string;
  note: string;
  color: string;
}

const AssignmentReadingViewer = () => {
  const { currentStage } = useAssignmentSubmissionProvider();

  const readings = useMemo(() => {
    if (!currentStage) {
      return [];
    }
    return (currentStage as AssignmentStageReading).config.readings || [];
  }, [currentStage]);

  const [modelTextGenerated, setModelTextGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');
  const [selectedColor, setSelectedColor] = useState('#fef08a'); // yellow
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const highlightColors = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Purple', value: '#e9d5ff' },
  ];

  const handleGenerateText = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setModelTextGenerated(true);
      setIsGenerating(false);
    }, 2000);
  }, []);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length == 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedStr = selection.toString().trim();

    if (textContainerRef.current?.contains(range.commonAncestorContainer)) {
      setSelectedText(selectedStr);
      setSelectionRange(range);
      setShowAnnotationDialog(true);
    }
  }, []);

  const applyHighlight = useCallback(
    (range: Range, color: string, id: string) => {
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.style.cursor = 'pointer';
      span.style.borderRadius = '2px';
      span.setAttribute('data-annotation-id', id);
      span.className = 'annotation-highlight';

      try {
        range.surroundContents(span);
      } catch (e) {
        console.error(e);
        // If surroundContents fails (e.g., partial selection), use a different approach
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
    },
    [],
  );

  const handleAddAnnotation = useCallback(() => {
    if (selectedText && selectionRange) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        text: selectedText,
        note: annotationNote,
        color: selectedColor,
      };

      setAnnotations([...annotations, newAnnotation]);

      // Apply highlight to the selected text
      applyHighlight(selectionRange, selectedColor, newAnnotation.id);

      // Reset
      setSelectedText('');
      setAnnotationNote('');
      setShowAnnotationDialog(false);
      setSelectionRange(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [
    annotationNote,
    annotations,
    applyHighlight,
    selectedColor,
    selectedText,
    selectionRange,
  ]);

  const handleDeleteAnnotation = useCallback(
    (id: string) => {
      // Remove from state
      setAnnotations(annotations.filter(a => a.id !== id));

      // Remove highlight from DOM
      const highlight = textContainerRef.current?.querySelector(
        `[data-annotation-id="${id}"]`,
      );
      if (highlight) {
        const parent = highlight.parentNode;
        if (parent) {
          while (highlight.firstChild) {
            parent.insertBefore(highlight.firstChild, highlight);
          }
          parent.removeChild(highlight);
        }
      }
    },
    [annotations],
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
      setTimeout(handleTextSelection, 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
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

                  <div className="min-h-[600px] pr-4 overflow-auto">
                    <div
                      className="select-text"
                      ref={textContainerRef}
                      style={{ userSelect: 'text' }}
                    >
                      <p className="mb-4 leading-relaxed whitespace-pre-wrap">
                        {readings[0]}
                      </p>
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
              -
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
              description={`${annotations.length} note${annotations.length === 1 ? '' : 's'} added`}
              title={
                <>
                  <StickyNote className="h-5 w-5 text-primary" />
                  My Annotations
                </>
              }
            >
              <div className="h-[calc(100vh-360px)] pr-4 overflow-auto">
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
                    // onClick={onComplete}
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Continue to Writing Stage
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Annotation Dialog */}
      {showAnnotationDialog && (
        <Modal onClose={handleCancelAnnotation} open={showAnnotationDialog}>
          <div
            className={clsx(
              'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
              'bg-white p-4 rounded-lg flex flex-col gap-4',
            )}
          >
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="text-lg leading-none font-semibold">
                  Add Annotation
                </div>
                <div className="text-muted-foreground text-sm">
                  Selected text: &quot;{selectedText.substring(0, 50)}
                  {selectedText.length > 50 ? '...' : ''}&quot;
                </div>
              </div>
              <Clickable onClick={handleCancelAnnotation}>
                <X />
              </Clickable>
            </div>

            <div>
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

            <div>
              <label className="text-sm font-medium mb-2 block">
                Add Note (Optional)
              </label>
              <TextInput
                multiline
                onChange={e => setAnnotationNote(e.target.value)}
                placeholder="Why is this passage important? What did you notice about the structure or language?"
                rows={4}
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
        </Modal>
      )}
    </div>
  );
};

export default AssignmentReadingViewer;
