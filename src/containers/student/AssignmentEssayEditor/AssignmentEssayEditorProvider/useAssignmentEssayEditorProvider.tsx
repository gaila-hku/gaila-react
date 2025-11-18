import React, { useContext } from 'react';

import AssignmentEssayEditorProviderContext from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/context';

const useAssignmentEssayEditorProvider = () => {
  return useContext(AssignmentEssayEditorProviderContext);
};

export default useAssignmentEssayEditorProvider;
