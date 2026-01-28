export const getAgentName = (agentType: string) => {
  switch (agentType) {
    case 'ideation_guiding':
      return 'Ideation';
    case 'outline_review':
      return 'Outline Review';
    case 'dictionary':
      return 'Dictionary';
    case 'autograde':
      return 'Auto Grading';
    case 'revision':
      return 'AI Revision';
    default:
      return agentType;
  }
};
