import React, { useCallback, useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import Badge from 'components/display/Badge';
import Button from 'components/input/Button';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentStageLanguagePreparation } from 'types/assignment';

const AssignmentLanguageViewerReading = () => {
  const { currentStage } = useAssignmentSubmissionProvider();

  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);

  const sampleTexts = useMemo(() => {
    if (!currentStage) {
      return [];
    }
    return (
      (currentStage as AssignmentStageLanguagePreparation).config.readings || []
    );
  }, [currentStage]);

  const handleNextSample = useCallback(() => {
    if (currentSampleIndex < sampleTexts.length - 1) {
      setCurrentSampleIndex(currentSampleIndex + 1);
    }
  }, [currentSampleIndex, sampleTexts.length]);

  const handlePreviousSample = useCallback(() => {
    if (currentSampleIndex > 0) {
      setCurrentSampleIndex(currentSampleIndex - 1);
    }
  }, [currentSampleIndex]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary">
          Sample {currentSampleIndex + 1} of {sampleTexts.length}
        </Badge>
        <div className="flex gap-2">
          <Button
            className="gap-1"
            disabled={currentSampleIndex === 0}
            onClick={handlePreviousSample}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            className="gap-1"
            disabled={currentSampleIndex === sampleTexts.length - 1}
            onClick={handleNextSample}
            size="sm"
            variant="outline"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-330px)] pr-4 overflow-auto space-y-4 whitespace-pre-wrap">
        {sampleTexts[currentSampleIndex]}
      </div>
    </>
  );
};

export default AssignmentLanguageViewerReading;
