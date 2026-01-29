import React from 'react';

import type {
  AssignmentGoalContent,
  AssignmentProgress,
  AssignmentReadonlyMessage,
  AssignmentStage,
} from 'types/assignment';

export interface AssignmentEssayEditorProviderType {
  assignmentProgress: AssignmentProgress | undefined;
  currentStage: AssignmentStage | null;
  title: string;
  setTitle: (title: string) => void;
  outline: string;
  setOutline: (outline: string) => void;
  essay: string;
  setEssay: (essay: string) => void;
  outlineConfirmed: boolean;
  setOutlineConfirmed: (confirmed: boolean) => void;
  draftConfirmed: boolean;
  setDraftConfirmed: (confirmed: boolean) => void;
  goalContent: AssignmentGoalContent | null;
  setGoalContent: (goals: AssignmentGoalContent | null) => void;
  nextStageType: AssignmentStage['stage_type'] | null;
  readonly: boolean;
  readonlyMessage: AssignmentReadonlyMessage | null;
  essayInit: boolean;
}

const AssignmentEssayEditorProviderContext =
  React.createContext<AssignmentEssayEditorProviderType>({
    assignmentProgress: undefined,
    currentStage: null,
    title: '',
    setTitle: () => {},
    outline: '',
    setOutline: () => {},
    essay: '',
    setEssay: () => {},
    outlineConfirmed: false,
    setOutlineConfirmed: () => {},
    draftConfirmed: false,
    setDraftConfirmed: () => {},
    goalContent: null,
    setGoalContent: () => {},
    nextStageType: null,
    readonly: false,
    readonlyMessage: null,
    essayInit: false,
  });

export const { Provider, Consumer } = AssignmentEssayEditorProviderContext;

export default AssignmentEssayEditorProviderContext;
