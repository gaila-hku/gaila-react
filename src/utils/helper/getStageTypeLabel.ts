const getStageTypeLabel = (stage: { stage_type: string }) => {
  switch (stage.stage_type) {
    case 'reading':
      return 'Reading';
    case 'language_preparation':
      return 'Language Preparation';
    case 'goal_setting':
      return 'Goal Setting';
    case 'outlining':
      return 'Writing - Outlining';
    case 'drafting':
      return 'Writing - Drafting';
    case 'revising':
      return 'Writing - Revising';
    case 'writing':
      return 'Writing';
    case 'reflection':
      return 'Reflection';
    default:
      return '';
  }
};

export default getStageTypeLabel;
