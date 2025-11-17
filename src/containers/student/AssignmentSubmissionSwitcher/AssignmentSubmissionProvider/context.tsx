import React from 'react';

import type { AssignmentProgress } from 'types/assignment';

export type Role = 'admin' | 'teacher' | 'student';

export interface AssignmentSubmissionProviderType {
  assignmentProgress: AssignmentProgress | undefined;
  isLoading: boolean;
  error: unknown | null;
  isStepperClickable: boolean;
  currentStage: AssignmentProgress['stages'][number] | null;
  setCurrentStageIndex: (index: number) => void;
}

const AssignmentSubmissionProviderContext =
  React.createContext<AssignmentSubmissionProviderType>({
    assignmentProgress: undefined,
    isLoading: false,
    error: null,
    isStepperClickable: false,
    currentStage: null,
    setCurrentStageIndex: () => {},
  });

export const { Provider, Consumer } = AssignmentSubmissionProviderContext;

export default AssignmentSubmissionProviderContext;
