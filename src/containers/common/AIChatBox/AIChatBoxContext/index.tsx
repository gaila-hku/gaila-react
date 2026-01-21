import React, { useCallback, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { useMutation } from 'react-query';

import { Provider } from 'containers/common/AIChatBox/AIChatBoxContext/context';
import {
  type ChatMessage,
  gptResponseToChatMessage,
} from 'containers/common/AIChatBox/utils';

import { apiAskGpt } from 'api/gpt';

type Props = {
  essay?: string;
  toolId: number;
  children: React.ReactNode;
};

const AIChatBoxProvider = ({ essay, toolId, children }: Props) => {
  const { mutateAsync: sendQuestion, isLoading: isAgentTyping } =
    useMutation(apiAskGpt);

  const [chatInput, setChatInput] = useState('');
  const [newChatMessages, setNewChatMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = useCallback(
    async (inputQuestion?: string) => {
      const question = inputQuestion || chatInput;
      if (!question.trim()) {
        return;
      }
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: dayjs(),
      };

      setNewChatMessages(prev => [...prev, userMessage]);
      setChatInput('');

      const gptResponse = await sendQuestion({
        question: question,
        assignment_tool_id: toolId,
        essay,
      });
      setNewChatMessages(prev => [
        ...prev,
        gptResponseToChatMessage(gptResponse),
      ]);
    },
    [chatInput, essay, sendQuestion, toolId],
  );

  const value = useMemo(
    () => ({
      toolId,
      sendMessage: handleSendMessage,
      isAgentTyping,
      chatInput,
      setChatInput,
      newChatMessages,
      setNewChatMessages,
    }),
    [chatInput, handleSendMessage, isAgentTyping, newChatMessages, toolId],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AIChatBoxProvider;
