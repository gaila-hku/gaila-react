import React, { type RefObject } from 'react';

import type {
  Assignment,
  AssignmentEssayContent,
  AssignmentGoal,
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
  goals: AssignmentGoal[];
  setGoals: (goals: AssignmentGoal[]) => void;
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
    essayContent: { current: { content: '' } },
    getEssayContent: () => '',
    getEssayWordCount: () => 0,
    goals: [],
    setGoals: () => {},
    readonly: false,
  });

export const { Provider, Consumer } = AssignmentEssayEditorProviderContext;

export default AssignmentEssayEditorProviderContext;
