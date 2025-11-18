import React from 'react';

import type { UseMutateFunction } from 'react-query';

import type { AssignmentSaveSubmissionPayload } from 'api/assignment';
import type {
  AssignmentProgress,
  AssignmentSubmission,
} from 'types/assignment';

export interface AssignmentSubmissionProviderType {
  assignmentProgress: AssignmentProgress | undefined;
  isLoading: boolean;
  error: unknown | null;
  isStepperClickable: boolean;
  currentStage: AssignmentProgress['stages'][number] | null;
  setCurrentStageIndex: (index: number) => void;
  saveSubmission: UseMutateFunction<
    AssignmentSubmission,
    unknown,
    AssignmentSaveSubmissionPayload,
    unknown
  >;
}

const AssignmentSubmissionProviderContext =
  React.createContext<AssignmentSubmissionProviderType>({
    assignmentProgress: undefined,
    isLoading: false,
    error: null,
    isStepperClickable: false,
    currentStage: null,
    setCurrentStageIndex: () => {},
    saveSubmission: () => {},
  });

export const { Provider, Consumer } = AssignmentSubmissionProviderContext;

export default AssignmentSubmissionProviderContext;
