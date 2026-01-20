const getStageTypeLabel = (stage: { stage_type: string }, short?: boolean) => {
  switch (stage.stage_type) {
    case 'reading':
      return 'Reading';
    case 'language_preparation':
      return 'Language Preparation';
    case 'goal_setting':
      return 'Goal Setting';
    case 'outlining':
      return short ? 'Outlining' : 'Writing - Outlining';
    case 'drafting':
      return short ? 'Drafting' : 'Writing - Drafting';
    case 'revising':
      return short ? 'Revising' : 'Writing - Revising';
    case 'writing':
      return 'Writing';
    case 'reflection':
      return 'Reflection';
    default:
      return '';
  }
};

export default getStageTypeLabel;
