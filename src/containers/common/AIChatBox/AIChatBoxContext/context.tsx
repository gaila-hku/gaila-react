import React from 'react';

import type { ChatMessage } from 'containers/common/AIChatBox/utils';

export interface AIChatBoxProviderType {
  toolId: number;
  sendMessage: (message?: string) => Promise<void>;
  isAgentTyping: boolean;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  newChatMessages: ChatMessage[];
  setNewChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const AIChatBoxProviderContext = React.createContext<AIChatBoxProviderType>({
  toolId: -1,
  sendMessage: async () => {},
  isAgentTyping: false,
  chatInput: '',
  setChatInput: () => {},
  newChatMessages: [],
  setNewChatMessages: () => {},
});

export const { Provider, Consumer } = AIChatBoxProviderContext;

export default AIChatBoxProviderContext;
