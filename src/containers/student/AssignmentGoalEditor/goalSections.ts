const GOAL_SECTIONS = [
  {
    question: 'What is your main writing goal for this essay?',
    goalPlaceholder:
      'e.g. Improve tenses, paragraph transitions, develop detailed arguments...',
    strategyPlaceholder:
      'e.g., Spend 10 minutes on outlining, check tenses before submitting...',
    categoryKey: 'writing_goals' as const,
  },
  {
    question: 'What are your goals related to AI tools for this essay?',
    goalPlaceholder:
      'e.g., Use a wider variety of tools, use more/less AI this time...',
    strategyPlaceholder:
      'e.g., Use AI for brainstorming ideas, checking grammar, example phrases...',
    categoryKey: 'ai_goals' as const,
  },
];

export default GOAL_SECTIONS;
