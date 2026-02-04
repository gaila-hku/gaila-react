import React, { useCallback, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { Highlighter, X } from 'lucide-react';

import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import {
  getIndicesFromRange,
  highlightAnnotation,
  highlightColors,
} from 'containers/common/Annotation/utils';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AnnotationItem,
  AssignmentLanguagePreparationContent,
  AssignmentReadingContent,
  AssignmentStageReading,
  LanguageStageAnnotationItem,
} from 'types/assignment';

type Props = {
  textContainerRef: React.RefObject<HTMLDivElement | null>;
  currentTextIndex: number;
  saveAnnotations: (annotations: AnnotationItem[], isFinal: boolean) => void;
  dialogHorizontalOffset?: number;
};

const useAnnotation = ({
  textContainerRef,
  currentTextIndex,
  saveAnnotations,
  dialogHorizontalOffset = 20,
}: Props) => {
  const { currentStage } = useAssignmentSubmissionProvider();

  const annotationLabels = useMemo(() => {
    if (!currentStage) {
      return [];
    }
    return (
      (currentStage as AssignmentStageReading).config.annotation_labels || []
    );
  }, [currentStage]);

  const [annotations, setAnnotations] = useState<
    (AnnotationItem | LanguageStageAnnotationItem)[]
  >([]);
  const [annotationNote, setAnnotationNote] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  useEffect(() => {
    if (currentStage?.submission?.content) {
      const content = currentStage.submission.content as
        | AssignmentReadingContent
        | AssignmentLanguagePreparationContent;
      setAnnotations(content.annotations || []);
    }
  }, [currentStage]);

  const currentTextAnnotations = useMemo(() => {
    return annotations.filter(
      annotation => annotation.text_index == currentTextIndex,
    );
  }, [annotations, currentTextIndex]);

  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({
    top: 0,
    left: 0,
    bottom: 0,
  });

  const [selectedText, setSelectedText] = useState('');
  const [selectionIndices, setSelectionIndices] = useState<{
    start: number;
    end: number;
  } | null>(null);

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
  }, [currentTextAnnotations, textContainerRef]);

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
      setSelectionPosition({
        top: rect.top,
        left: (rect.left + rect.right) / 2,
        bottom: rect.bottom,
      });
    }
  }, [textContainerRef]);

  useEffect(() => {
    rebuildHighlights();
  }, [currentTextIndex, rebuildHighlights]);

  const handleAddAnnotation = useCallback(() => {
    if (selectedText && selectionIndices) {
      const newAnnotation: AnnotationItem = {
        id: dayjs().valueOf(),
        text: selectedText,
        note: annotationNote,
        color:
          highlightColors[selectedColorIndex % highlightColors.length].name,
        label: annotationLabels[selectedColorIndex],
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
    annotationLabels,
    annotationNote,
    annotations,
    currentTextIndex,
    saveAnnotations,
    selectedColorIndex,
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

  const annotationDialog = useMemo(() => {
    if (!showAnnotationDialog) {
      return <></>;
    }

    return (
      <div
        className={clsx(
          'fixed w-[400px] z-10',
          'bg-white border-4 p-4 rounded-lg flex flex-col gap-4',
        )}
        style={{
          top:
            selectionPosition.top > window.innerHeight / 2
              ? selectionPosition.top
              : selectionPosition.top,
          left: Math.max(
            dialogHorizontalOffset,
            Math.min(
              selectionPosition.left - 200,
              window.innerWidth - dialogHorizontalOffset - 400,
            ),
          ),
          transform:
            selectionPosition.top > window.innerHeight / 2
              ? 'translateY(-100%)'
              : `translateY(${selectionPosition.bottom - selectionPosition.top + 2}px)`,
        }}
      >
        <div>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                {annotationLabels.length ? 'Choose Label' : 'Highlight Color'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  ...Array(annotationLabels.length || highlightColors.length),
                ].map((_, index) => {
                  const color = highlightColors[index % highlightColors.length];
                  const annotationLabel = annotationLabels[index];
                  return (
                    <Clickable
                      className={clsx(
                        'rounded border-2 border-solid transition-all',
                        selectedColorIndex === index
                          ? 'border-primary scale-110'
                          : 'border-border hover:border-primary/50',
                        annotationLabels.length ? 'px-1' : 'w-10 h-10',
                      )}
                      key={index}
                      onClick={() => setSelectedColorIndex(index)}
                      style={{
                        backgroundColor: color.backgroundColor,
                        color: color.textColor,
                      }}
                      title={color.name}
                    >
                      {!!annotationLabel && annotationLabel}
                    </Clickable>
                  );
                })}
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
    );
  }, [
    annotationLabels,
    annotationNote,
    dialogHorizontalOffset,
    handleAddAnnotation,
    handleCancelAnnotation,
    selectedColorIndex,
    selectionPosition,
    showAnnotationDialog,
  ]);

  return {
    annotations,
    setAnnotations,
    currentTextAnnotations,
    handleDeleteAnnotation,
    annotationDialog,
  };
};

export default useAnnotation;
