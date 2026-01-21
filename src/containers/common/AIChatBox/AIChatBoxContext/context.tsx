import React from 'react';

import type { ChatMessage } from 'containers/common/AIChatBox/utils';

import type { GptLog } from 'types/gpt';

export interface AIChatBoxProviderType {
  toolId: number;
  sendMessage: (message?: string) => Promise<void>;
  apiMessages: GptLog[];
  isLoading: boolean;
  endReached: boolean;
  setPages: React.Dispatch<React.SetStateAction<number>>;
  setPageLimit: React.Dispatch<React.SetStateAction<number | undefined>>;
  error: unknown;
  isAgentTyping: boolean;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  newChatMessages: ChatMessage[];
  setNewChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const AIChatBoxProviderContext = React.createContext<AIChatBoxProviderType>({
  toolId: -1,
  sendMessage: async () => {},
  apiMessages: [],
  isLoading: false,
  endReached: false,
  setPages: () => {},
  setPageLimit: () => {},
  error: null,
  isAgentTyping: false,
  chatInput: '',
  setChatInput: () => {},
  newChatMessages: [],
  setNewChatMessages: () => {},
});

export const { Provider, Consumer } = AIChatBoxProviderContext;

export default AIChatBoxProviderContext;
