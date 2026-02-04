import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import dayjs from 'dayjs';
import {
  type UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from 'react-query';

import useInfiniteListing from 'components/display/InfiniteList/useInfiniteListing';

import { Provider } from 'containers/common/AIChatBox/AIChatBoxContext/context';
import {
  type ChatMessage,
  gptResponseToChatMessage,
} from 'containers/common/AIChatBox/utils';

import {
  type AskGptStructuredRequestData,
  apiAskGpt,
  apiGetGptChatLogs,
} from 'api/gpt';
import type { GptLog } from 'types/gpt';
import tuple from 'utils/types/tuple';

type Props = {
  toolId: number;
  essay?: string;
  reading?: string;
  firstMessage?: string;
  chatMutateFn?: UseMutateAsyncFunction<
    GptLog,
    unknown,
    AskGptStructuredRequestData,
    unknown
  >;
  children: React.ReactNode;
};

const AIChatBoxProvider = ({
  toolId,
  essay,
  reading,
  firstMessage,
  chatMutateFn = apiAskGpt,
  children,
}: Props) => {
  const queryClient = useQueryClient();
  const { mutateAsync: sendQuestion, isLoading: isAgentTyping } =
    useMutation(chatMutateFn);

  const [chatInput, setChatInput] = useState('');
  const [newChatMessages, setNewChatMessages] = useState<ChatMessage[]>([]);

  const { data, isLoading, endReached, setPages, setPageLimit, error } =
    useInfiniteListing<GptLog>({
      queryFn: apiGetGptChatLogs,
      queryKey: tuple([
        apiGetGptChatLogs.queryKey,
        { assignment_tool_id: toolId, page: 1, limit: 10 },
      ]),
      pageLimit: 1,
    });

  const chatInit = useRef(false);
  // Add first message if no data
  useEffect(() => {
    if (chatInit.current || isLoading) {
      return;
    }
    if (!data.length && firstMessage) {
      setNewChatMessages([
        {
          id: 'first_message',
          role: 'assistant',
          content: firstMessage,
          timestamp: dayjs(),
        },
      ]);
    }
    chatInit.current = true;
  }, [data, firstMessage, isLoading, setNewChatMessages]);

  // Refetch when toolId changes
  useEffect(() => {
    chatInit.current = false;
    setNewChatMessages([]);
    setChatInput('');
    queryClient.invalidateQueries([apiGetGptChatLogs.queryKey]);
  }, [queryClient, toolId]);

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
        reading,
        is_structured: false,
      });
      setNewChatMessages(prev => [
        ...prev,
        gptResponseToChatMessage(gptResponse),
      ]);
    },
    [chatInput, essay, reading, sendQuestion, toolId],
  );

  const value = useMemo(
    () => ({
      toolId,
      sendMessage: handleSendMessage,
      apiMessages: data,
      isLoading,
      endReached,
      setPages,
      setPageLimit,
      error,
      isAgentTyping,
      chatInput,
      setChatInput,
      newChatMessages,
      setNewChatMessages,
    }),
    [
      chatInput,
      data,
      endReached,
      error,
      handleSendMessage,
      isAgentTyping,
      isLoading,
      newChatMessages,
      setPageLimit,
      setPages,
      toolId,
    ],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default AIChatBoxProvider;
