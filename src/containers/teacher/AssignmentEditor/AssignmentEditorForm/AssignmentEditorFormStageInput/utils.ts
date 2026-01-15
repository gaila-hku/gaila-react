import type { AssignmentStageEditType } from 'types/assignment';

const DEFAULT_STAGES: AssignmentStageEditType[] = [
  {
    stage_type: 'goal_setting',
    enabled: true,
    tools: [{ key: 'goal_general', enabled: true }],
    config: {},
  },
  {
    stage_type: 'outlining',
    enabled: true,
    tools: [
      { key: 'ideation_guiding', enabled: true },
      { key: 'outline_review', enabled: true },
      { key: 'dictionary', enabled: true },
      { key: 'outlining_general', enabled: true },
    ],
    config: {},
  },
  {
    stage_type: 'drafting',
    enabled: true,
    tools: [
      { key: 'dictionary', enabled: true },
      { key: 'autograde', enabled: true },
      { key: 'drafting_general', enabled: true },
    ],
    config: {},
  },
  {
    stage_type: 'revising',
    enabled: true,
    tools: [
      { key: 'dictionary', enabled: true },
      { key: 'autograde', enabled: true },
      { key: 'revision', enabled: true },
      { key: 'revising_general', enabled: true },
    ],
    config: { revision_tool_ask_explanation: true },
  },
  {
    stage_type: 'reflection',
    enabled: true,
    tools: [{ key: 'reflection_general', enabled: true }],
    config: {},
  },
];

const READING_STAGE_TOOLS = [
  { key: 'reading_general', label: 'General Chatbot' },
];

const LANGUAGE_STAGE_TOOLS = [
  { key: 'language_general', label: 'General Chatbot' },
];

const GOAL_STAGE_TOOLS = [{ key: 'goal_general', label: 'General Chatbot' }];

const OUTLINE_STAGE_TOOLS = [
  {
    key: 'ideation_guiding',
    label: 'Ideation Agent',
  },
  {
    key: 'outline_review',
    label: 'Outline Review Agent',
  },
  { key: 'dictionary', label: 'Dictionary Chatbot' },
  { key: 'outlining_general', label: 'General Chatbot' },
];

const DRAFTING_STAGE_TOOLS = [
  { key: 'dictionary', label: 'Dictionary Chatbot' },
  { key: 'autograde', label: 'AI Auto Grading' },
  { key: 'drafting_general', label: 'General Chatbot' },
];

const REVISING_STAGE_TOOLS = [
  { key: 'dictionary', label: 'Dictionary Chatbot' },
  { key: 'autograde', label: 'AI Auto Grading' },
  {
    key: 'revision',
    label: 'AI Revision',
  },
  { key: 'revising_general', label: 'General Chatbot' },
];

const REFLECTION_STAGE_TOOLS = [
  { key: 'reflection_general', label: 'General Chatbot' },
];

const validateStageOrder = (
  stages: AssignmentStageEditType[],
): string | null => {
  let goalSettingIndex = -5;
  let outliningIndex = -4;
  let draftingIndex = -3;
  let revisingIndex = -2;
  let reflectionIndex = -1;

  for (const stage of stages) {
    if (stage.stage_type === 'goal_setting') {
      goalSettingIndex = stages.indexOf(stage);
    } else if (stage.stage_type === 'outlining') {
      outliningIndex = stages.indexOf(stage);
    } else if (stage.stage_type === 'drafting') {
      draftingIndex = stages.indexOf(stage);
    } else if (stage.stage_type === 'revising') {
      revisingIndex = stages.indexOf(stage);
    } else if (stage.stage_type === 'reflection') {
      reflectionIndex = stages.indexOf(stage);
    }
  }

  if (
    goalSettingIndex > outliningIndex ||
    goalSettingIndex > draftingIndex ||
    goalSettingIndex > revisingIndex ||
    goalSettingIndex > reflectionIndex
  ) {
    return 'Goal Setting must come before writing or reflection stages';
  }

  if (
    outliningIndex > draftingIndex ||
    outliningIndex > revisingIndex ||
    outliningIndex > reflectionIndex
  ) {
    return 'Outlining must come before drafting, revising or reflection stages';
  }

  if (draftingIndex > revisingIndex || draftingIndex > reflectionIndex) {
    return 'Drafting must come before revising or reflection stages';
  }

  if (revisingIndex > reflectionIndex) {
    return 'Revising must come before reflection stages';
  }

  return null;
};

export {
  DEFAULT_STAGES,
  DRAFTING_STAGE_TOOLS,
  GOAL_STAGE_TOOLS,
  LANGUAGE_STAGE_TOOLS,
  OUTLINE_STAGE_TOOLS,
  READING_STAGE_TOOLS,
  REFLECTION_STAGE_TOOLS,
  REVISING_STAGE_TOOLS,
  validateStageOrder,
};
