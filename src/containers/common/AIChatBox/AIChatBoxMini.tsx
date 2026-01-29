import React, { useEffect, useRef } from 'react';

import { Bot, Send } from 'lucide-react';

import ErrorMessage from 'components/display/ErrorMessage';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import useAIChatBox from 'containers/common/AIChatBox/AIChatBoxContext/useAIChatBox';
import LoadingMessage from 'containers/common/AIChatBox/LoadingMessage';
import {
  renderChatMessage,
  renderGptLog,
} from 'containers/common/AIChatBox/utils';

type Props = {
  chatName?: string;
  firstMessage?: string;
  placeholder?: string;
};

const AIChatBoxMini = ({ chatName, firstMessage, placeholder }: Props) => {
  const {
    sendMessage,
    apiMessages,
    isLoading,
    endReached,
    setPages,
    setPageLimit,
    error,
    isAgentTyping,
    chatInput,
    setChatInput,
    newChatMessages,
  } = useAIChatBox();

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [newChatMessages, apiMessages, isAgentTyping]);

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

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">{chatName}</h4>
      </div>

      <div
        className="h-[200px] p-3 border rounded-lg bg-muted/30 overflow-y-auto space-y-3"
        ref={chatScrollRef}
      >
        {isLoading && <Loading />}
        {Array.from(apiMessages)
          .reverse()
          .map(log => renderGptLog(log, true))}
        {newChatMessages.map(message => renderChatMessage(message, true))}
        {!apiMessages.length && !newChatMessages.length && firstMessage && (
          <p className="text-xs text-muted-foreground italic">{firstMessage}</p>
        )}
        {isAgentTyping && <LoadingMessage />}
      </div>

      {!error && <ErrorMessage error={error} />}

      <div className="flex gap-2">
        <TextInput
          className="text-sm"
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={placeholder || 'Ask anything...'}
          value={chatInput}
        />
        <Button
          className="flex-shrink-0"
          disabled={!chatInput.trim() || isAgentTyping}
          onClick={() => sendMessage()}
          size="sm"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatBoxMini;
