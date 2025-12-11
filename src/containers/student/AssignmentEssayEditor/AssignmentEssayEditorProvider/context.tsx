import React from 'react';

import type {
  Assignment,
  AssignmentGoalContent,
  AssignmentGrade,
  AssignmentProgress,
  AssignmentStage,
} from 'types/assignment';

export interface AssignmentEssayEditorProviderType {
  assignmentProgress: AssignmentProgress | undefined;
  isLoading: boolean;
  error: unknown | null;
  currentStage: AssignmentStage | null;
  assignment: Assignment | null;
  teacherGrade: AssignmentGrade | null;
  essay: string;
  setEssay: (essay: string) => void;
  outlineConfirmed: boolean;
  setOutlineConfirmed: (confirmed: boolean) => void;
  draftConfirmed: boolean;
  setDraftConfirmed: (confirmed: boolean) => void;
  goalContent: AssignmentGoalContent | null;
  setGoalContent: (goals: AssignmentGoalContent | null) => void;
  readonly: boolean;
}

const AssignmentEssayEditorProviderContext =
  React.createContext<AssignmentEssayEditorProviderType>({
    assignmentProgress: undefined,
    isLoading: false,
    error: null,
    currentStage: null,
    assignment: null,
    teacherGrade: null,
    essay: '',
    setEssay: () => {},
    outlineConfirmed: false,
    setOutlineConfirmed: () => {},
    draftConfirmed: false,
    setDraftConfirmed: () => {},
    goalContent: null,
    setGoalContent: () => {},
    readonly: false,
  });

export const { Provider, Consumer } = AssignmentEssayEditorProviderContext;

export default AssignmentEssayEditorProviderContext;
