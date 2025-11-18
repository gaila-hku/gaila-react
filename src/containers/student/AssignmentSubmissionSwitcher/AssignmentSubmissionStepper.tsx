import React, { useCallback } from 'react';

import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useMutation } from 'react-query';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiSaveTraceData } from 'api/trace-data';
import getStageTypeLabel from 'utils/helper/getStageTypeLabel';

const AssignmentSubmissionStepper = () => {
  const {
    assignmentProgress,
    currentStage,
    isStepperClickable,
    setCurrentStageIndex,
  } = useAssignmentSubmissionProvider();
  const { mutate: saveTraceData } = useMutation(apiSaveTraceData);

  const handleStepClick = useCallback(
    (index: number) => {
      if (!isStepperClickable || !assignmentProgress || !currentStage) {
        return;
      }
      setCurrentStageIndex(index);
      saveTraceData({
        assignment_id: assignmentProgress.assignment.id || null,
        stage_id: null,
        action: 'SWITCH_ESSAY_STAGE',
        content: JSON.stringify({
          stage: assignmentProgress.stages[index].stage_type,
        }),
      });
    },
    [
      assignmentProgress,
      currentStage,
      isStepperClickable,
      saveTraceData,
      setCurrentStageIndex,
    ],
  );

  if (!assignmentProgress) {
    return <></>;
  }

  const inactiveStages =
    assignmentProgress.stages.filter(s => !s.enabled) || [];
  const stepperActiveStep = Math.max(
    assignmentProgress.current_stage - inactiveStages.length,
    0,
  );

  return (
    <Stepper
      activeStep={
        isStepperClickable
          ? assignmentProgress.stages.length - 1
          : stepperActiveStep
      }
      className="basis-[400px]"
    >
      {assignmentProgress.stages
        .filter(s => s.enabled)
        .map((stage, index) => (
          <Step
            className={isStepperClickable ? 'cursor-pointer' : ''}
            key={stage.stage_type}
            onClick={() => handleStepClick(index)}
          >
            <StepLabel>{getStageTypeLabel(stage)}</StepLabel>
          </Step>
        ))}
    </Stepper>
  );
};

export default AssignmentSubmissionStepper;
