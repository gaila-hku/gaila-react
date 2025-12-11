import React, { useCallback, useEffect, useRef, useState } from 'react';

import dayjs from 'dayjs';
import { Bot, Send } from 'lucide-react';
import { type UseMutateAsyncFunction, useMutation } from 'react-query';

import ErrorMessage from 'components/display/ErrorMessage';
import useInfiniteListing from 'components/display/InfiniteList/useInfiniteListing';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import LoadingMessage from 'containers/common/AIChatBox/LoadingMessage';
import {
  type ChatMessage,
  gptResponseToChatMessage,
  renderChatMessage,
  renderGptLog,
} from 'containers/common/AIChatBox/utils';

import { type AskGptStructuredRequestData, apiGetGptChatLogs } from 'api/gpt';
import type { GptLog } from 'types/gpt';
import tuple from 'utils/types/tuple';

type Props = {
  toolId: number;
  chatName?: string;
  firstMessage?: string;
  placeholder?: string;
  chatMutateFn: UseMutateAsyncFunction<
    GptLog,
    unknown,
    AskGptStructuredRequestData,
    unknown
  >;
  essay?: string;
};

const AIChatBoxMini = ({
  toolId,
  chatName,
  firstMessage,
  placeholder,
  chatMutateFn,
  essay,
}: Props) => {
  const { mutateAsync: sendQuestion, isLoading: isAgentTyping } =
    useMutation(chatMutateFn);

  const { data, isLoading, endReached, setPages, setPageLimit, error } =
    useInfiniteListing<GptLog>({
      queryFn: apiGetGptChatLogs,
      queryKey: tuple([
        apiGetGptChatLogs.queryKey,
        { assignment_tool_id: toolId, page: 1, limit: 10 },
      ]),
      pageLimit: 1,
    });

  const [newChatMessages, setNewChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [newChatMessages, data, isAgentTyping]);

  // Load new messages when scrolled to top
  useEffect(() => {
    const handleScroll = () => {
      if (
        chatScrollRef.current &&
        chatScrollRef.current.scrollTop < 50 &&
        !isLoading &&
        !endReached
      ) {
        setPageLimit(limit => (limit ?? 3) + 5);
        setPages(prev => prev + 1);
      }
    };
    const scrollRef = chatScrollRef.current;
    if (scrollRef) {
      scrollRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollRef) {
        scrollRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [endReached, isLoading, setPageLimit, setPages]);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim()) {
      return;
    }
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: dayjs(),
    };

    setNewChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    const gptResponse = await sendQuestion({
      question: chatInput,
      assignment_tool_id: toolId,
      is_structured: false,
      essay,
    });
    setNewChatMessages(prev => [
      ...prev,
      gptResponseToChatMessage(gptResponse),
    ]);
  }, [chatInput, essay, sendQuestion, toolId]);

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">{chatName}</h4>
      </div>

      <div className="h-[200px] p-3 border rounded-lg bg-muted/30 overflow-y-auto">
        <div className="space-y-3" ref={chatScrollRef}>
          {isLoading && <Loading />}
          {data.reverse().map(log => renderGptLog(log, true))}
          {newChatMessages.map(message => renderChatMessage(message, true))}
          {!data.length && !newChatMessages.length && firstMessage && (
            <p className="text-xs text-muted-foreground italic">
              {firstMessage}
            </p>
          )}
          {isAgentTyping && <LoadingMessage />}
        </div>
      </div>

      {!error && <ErrorMessage error={error} />}

      <div className="flex gap-2">
        <TextInput
          className="text-sm"
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={placeholder || 'Ask anything...'}
          value={chatInput}
        />
        <Button
          className="flex-shrink-0"
          disabled={!chatInput.trim() || isAgentTyping}
          onClick={handleSendMessage}
          size="sm"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatBoxMini;
