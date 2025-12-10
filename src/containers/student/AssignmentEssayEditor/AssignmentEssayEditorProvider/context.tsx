import React, { type RefObject } from 'react';

import type {
  Assignment,
  AssignmentEssayContent,
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
  essayContent: RefObject<Omit<AssignmentEssayContent, 'goals' | 'title'>>;
  getEssayContent: () => string;
  getEssayWordCount: (essay?: string) => number;
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
    essayContent: { current: { outline: '', essay: '' } },
    getEssayContent: () => '',
    getEssayWordCount: () => 0,
    goalContent: null,
    setGoalContent: () => {},
    readonly: false,
  });

export const { Provider, Consumer } = AssignmentEssayEditorProviderContext;

export default AssignmentEssayEditorProviderContext;
