const GOAL_QUESTIONS = [
  {
    question: 'What is your main writing goal for this essay?',
    placeholder:
      'e.g., Create a strong thesis statement, improve paragraph transitions, develop detailed arguments...',
    category: 'Main Goals' as const,
  },
  {
    question:
      'How do you plan to use AI assistance effectively in your writing process?',
    placeholder:
      'e.g., Use AI for brainstorming ideas, checking grammar, improving sentence clarity...',
    category: 'AI usage' as const,
  },
  {
    question: 'Which writing tools will you use to improve your essay quality?',
    placeholder:
      'e.g., Use the dictionary for vocabulary, checklist for grammar review, outline feature...',
    category: 'Tool usage' as const,
  },
  {
    question:
      'What specific strategies will you implement to stay focused and organized?',
    placeholder:
      'e.g., Break writing into sections, take regular breaks, use the rubric as a guide...',
    category: 'Organize strategy' as const,
  },
];

export default GOAL_QUESTIONS;
