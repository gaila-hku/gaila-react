import React from 'react';

import clsx from 'clsx';
import dayjs, { type Dayjs } from 'dayjs';
import { Bot, UserIcon } from 'lucide-react';

import type { GptLog } from 'types/gpt';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Dayjs;
}

export const gptResponseToChatMessage = (log: GptLog): ChatMessage => {
  return {
    id: String(log.id),
    role: 'assistant',
    content: log.gpt_answer,
    timestamp: dayjs(log.gpt_response_time),
  };
};

export const gptLogToChatMessages = (log: GptLog): ChatMessage[] => {
  return [
    {
      id: `${log.id}-user`,
      role: 'user',
      content: log.user_question,
      timestamp: dayjs(log.user_ask_time),
    },
    {
      id: `${log.id}-assistant`,
      role: 'assistant',
      content: log.gpt_answer,
      timestamp: dayjs(log.gpt_response_time),
    },
  ];
};

const formatChatMessage = (text: string) => {
  let trimmedText = text.trim();
  if (trimmedText.startsWith('"')) {
    trimmedText = trimmedText.slice(1);
  }
  if (trimmedText.endsWith('"')) {
    trimmedText = trimmedText.slice(0, -1);
  }
  return trimmedText.replace(/<br\s*\/?>/gi, '\n').replace(/\\"/g, '"');
};

export const renderGptLog = (log: GptLog, isMini?: boolean) => {
  return gptLogToChatMessages(log).map(message =>
    renderChatMessage(message, isMini),
  );
};

export const renderChatMessage = (message: ChatMessage, isMini?: boolean) => {
  return (
    <div
      className={`flex gap-2 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
      key={message.id}
    >
      {message.role === 'assistant' && (
        <div
          className={clsx(
            isMini ? 'h-5 w-5' : 'w-7 h-7',
            'flex-shrink-0 rounded-full bg-primary flex items-center justify-center',
          )}
        >
          <Bot
            className={clsx(
              isMini ? 'h-3 w-3' : 'h-4 w-4',
              'text-primary-foreground',
            )}
          />
        </div>
      )}
      <div
        className={clsx(
          'max-w-[85%] rounded-lg px-3 py-2',
          isMini ? 'text-xs' : 'text-sm',
          message.role === 'user' && 'bg-primary text-primary-foreground',
          message.role === 'assistant' && [
            'text-foreground',
            isMini ? 'bg-background border' : 'bg-muted',
          ],
        )}
      >
        <div className="whitespace-pre-wrap">
          {formatChatMessage(message.content)}
        </div>
      </div>
      {!isMini && message.role === 'user' && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
