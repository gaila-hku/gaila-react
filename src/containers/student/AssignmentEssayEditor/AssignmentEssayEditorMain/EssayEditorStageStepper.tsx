import React, { useMemo } from 'react';

import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

type Props = { activeWritingStep: 'outline' | 'draft' | 'revision' };

const EssayEditorStageStepper = ({ activeWritingStep }: Props) => {
  const { outliningEnabled, revisingEnabled } =
    useAssignmentSubmissionProvider();

  const activeStep = useMemo(() => {
    return [
      ...(outliningEnabled ? ['outline'] : []),
      'draft',
      ...(revisingEnabled ? ['revision'] : []),
    ].indexOf(activeWritingStep);
  }, [activeWritingStep, outliningEnabled, revisingEnabled]);

  if (!outliningEnabled && !revisingEnabled) {
    return null;
  }

  return (
    <div className="w-full py-4 px-4 bg-secondary/30 rounded-lg border">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        className="basis-[400px]"
      >
        {outliningEnabled && (
          <Step>
            <StepLabel>
              <div className="-mt-2">Outline</div>
              <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
                Plan your essay structure
              </div>
            </StepLabel>
          </Step>
        )}
        <Step>
          <StepLabel>
            <div className="-mt-2">Drafting</div>
            <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
              Write your first draft
            </div>
          </StepLabel>
        </Step>
        {revisingEnabled && (
          <Step>
            <StepLabel>
              <div className="-mt-2">Revising</div>
              <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
                Refine and polish
              </div>
            </StepLabel>
          </Step>
        )}
      </Stepper>
    </div>
  );
};

export default EssayEditorStageStepper;
