import React, { useMemo } from 'react';

import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

type Props = { activeWritingStep: 'outline' | 'draft' | 'revision' };

const EssayEditorStageStepper = ({ activeWritingStep }: Props) => {
  const { assignment } = useAssignmentSubmissionProvider();

  const activeStep = useMemo(() => {
    return [
      ...(assignment?.config?.outline_enabled ? ['outline'] : []),
      'draft',
      ...(assignment?.config?.revision_enabled ? ['revision'] : []),
    ].indexOf(activeWritingStep);
  }, [
    activeWritingStep,
    assignment?.config?.outline_enabled,
    assignment?.config?.revision_enabled,
  ]);

  if (
    !assignment?.config?.outline_enabled &&
    !assignment?.config?.revision_enabled
  ) {
    return null;
  }

  return (
    <div className="w-full py-4 px-4 bg-secondary/30 rounded-lg border">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        className="basis-[400px]"
      >
        {assignment?.config?.outline_enabled && (
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
        {assignment?.config?.revision_enabled && (
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
