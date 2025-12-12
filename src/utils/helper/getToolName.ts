const getToolName = (key: string) => {
  switch (key) {
    case 'autograde':
      return 'AI Auto Grading';
    case 'revision':
      return 'AI Revision';
    case 'grammar':
      return 'Grammar checker';
    case 'dictionary':
      return 'Dictionary';
  }
};

export default getToolName;
