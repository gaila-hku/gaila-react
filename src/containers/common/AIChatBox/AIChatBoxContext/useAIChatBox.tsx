import React, { useContext } from 'react';

import AIChatBoxProviderContext from 'containers/common/AIChatBox/AIChatBoxContext/context';

const useAIChatBox = () => {
  return useContext(AIChatBoxProviderContext);
};

export default useAIChatBox;
