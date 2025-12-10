import React, { useContext } from 'react';

import AssignmentSubmissionProviderContext from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/context';

const useAssignmentSubmissionProvider = () => {
  return useContext(AssignmentSubmissionProviderContext);
};

export default useAssignmentSubmissionProvider;
