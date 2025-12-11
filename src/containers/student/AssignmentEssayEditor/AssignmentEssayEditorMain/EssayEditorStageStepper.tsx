import React from 'react';

import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

type Props = { activeWritingStep: number };

const EssayEditorStageStepper = ({ activeWritingStep }: Props) => {
  return (
    <div className="w-full py-4 px-4 bg-secondary/30 rounded-lg border">
      <Stepper
        activeStep={activeWritingStep}
        alternativeLabel
        className="basis-[400px]"
      >
        <Step>
          <StepLabel>
            <div className="-mt-2">Outline</div>
            <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
              Plan your essay structure
            </div>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <div className="-mt-2">Drafting</div>
            <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
              Write your first draft
            </div>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <div className="-mt-2">Revising</div>
            <div className="text-xs text-muted-foreground/70 hidden sm:block font-normal">
              Refine and polish
            </div>
          </StepLabel>
        </Step>
      </Stepper>
    </div>
  );
};

export default EssayEditorStageStepper;
