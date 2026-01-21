import React, { useEffect, useRef } from 'react';

import { Bot, Send } from 'lucide-react';

import Card from 'components/display/Card';
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
  description?: string;
  suggestedPrompts?: { icon: any; text: string; category: string }[];
  placeholder?: string;
};

const AIChatBox = ({
  chatName,
  description,
  suggestedPrompts,
  placeholder,
}: Props) => {
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
  }, [apiMessages, newChatMessages, isAgentTyping]);

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

  const handlePromptClick = (promptText: string) => {
    setChatInput(promptText);
  };

  return (
    <Card
      classes={{
        root: 'flex flex-col h-[calc(100vh-200px)] !p-4',
        title: 'flex items-center gap-2 text-base -mb-2',
        children: 'flex flex-col flex-1 p-0 overflow-hidden',
        description: 'text-sm mb-2',
      }}
      description={description}
      title={
        <>
          <Bot className="h-4 w-4 text-primary" />
          {chatName || 'AI Assistant'}
        </>
      }
    >
      <div
        className="flex-1 overflow-y-auto py-3 space-y-4"
        ref={chatScrollRef}
      >
        {isLoading && <Loading />}
        {Array.from(apiMessages)
          .reverse()
          .map(log => renderGptLog(log))}
        {newChatMessages.map(message => renderChatMessage(message))}
        {isAgentTyping && <LoadingMessage />}
      </div>

      {!chatInput && !!suggestedPrompts?.length && (
        <div className="py-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Suggested:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                className="gap-1 text-xs h-auto py-1.5 justify-start"
                key={index}
                onClick={() => handlePromptClick(prompt.text)}
                size="sm"
                variant="outline"
              >
                <prompt.icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-left">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {!error && <ErrorMessage error={error} />}

      <div className="py-3 border-t">
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
            disabled={!chatInput.trim() || isAgentTyping}
            onClick={() => sendMessage()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChatBox;
