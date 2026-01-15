import React from 'react';

import type { UseMutateFunction } from 'react-query';

import type { AssignmentSaveSubmissionPayload } from 'api/assignment';
import type {
  Assignment,
  AssignmentGrade,
  AssignmentProgress,
  AssignmentSubmission,
} from 'types/assignment';

export interface AssignmentSubmissionProviderType {
  assignmentProgress: AssignmentProgress | undefined;
  isLoading: boolean;
  error: unknown | null;
  currentStage: AssignmentProgress['stages'][number] | null;
  assignment: Assignment | null;
  teacherGrade: AssignmentGrade | null;
  readonly: boolean;
  setCurrentStageIndex: (index: number) => void;
  saveSubmission: UseMutateFunction<
    AssignmentSubmission,
    unknown,
    AssignmentSaveSubmissionPayload,
    unknown
  >;
  isSaving: boolean;
  outliningEnabled: boolean;
  revisingEnabled: boolean;
}

const AssignmentSubmissionProviderContext =
  React.createContext<AssignmentSubmissionProviderType>({
    assignmentProgress: undefined,
    isLoading: false,
    error: null,
    currentStage: null,
    assignment: null,
    teacherGrade: null,
    readonly: false,
    setCurrentStageIndex: () => {},
    saveSubmission: () => {},
    isSaving: false,
    outliningEnabled: false,
    revisingEnabled: false,
  });

export const { Provider, Consumer } = AssignmentSubmissionProviderContext;

export default AssignmentSubmissionProviderContext;
