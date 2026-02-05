import React from 'react';

import clsx from 'clsx';
import dayjs, { type Dayjs } from 'dayjs';
import { Bot, ChevronRight, UserIcon } from 'lucide-react';

import Badge from 'components/display/Badge';
import Divider from 'components/display/Divider';
import Button from 'components/input/Button';

import { getProceedQuestion } from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorOutlineReviewTool';

import type { GptLog, OutlineReviewResult } from 'types/gpt';
import safeJsonParse from 'utils/helper/safeJSONparse';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
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

const formatChatMessage = (text: React.ReactNode) => {
  if (typeof text !== 'string') {
    return text;
  }
  let trimmedText = text.trim();
  if (trimmedText.startsWith('"')) {
    trimmedText = trimmedText.slice(1);
  }
  if (trimmedText.endsWith('"')) {
    trimmedText = trimmedText.slice(0, -1);
  }
  return trimmedText.replace(/<br\s*\/?>/gi, '\n').replace(/\\"/g, '"');
};

export const renderOutlineReviewLog = (
  log: GptLog,
  reviewResult: OutlineReviewResult | null,
  handleProceed: () => void,
  isLast: boolean,
) => {
  if (!log.extra) {
    return renderGptLog(log);
  }

  const extra = safeJsonParse(log.extra) as {
    current_step: number;
    is_next_step: boolean;
  };
  const currentStep = extra.current_step;
  const currentReviewResult = reviewResult?.comments[currentStep - 1];

  if (!currentReviewResult) {
    return renderGptLog(log);
  }

  console.log(log, reviewResult);

  const messages: ChatMessage[] = [];
  const isStart = log.user_question === 'OUTLINE_REVIEW';
  if (!isStart) {
    messages.push({
      id: `${log.id}-user`,
      role: 'user',
      content: extra.is_next_step
        ? getProceedQuestion(currentStep)
        : log.user_question,
      timestamp: dayjs(log.user_ask_time),
    });
  }
  messages.push({
    id: `${log.id}-assistant`,
    role: 'assistant',
    content: (
      <>
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge
            className=" bg-white text-primary border-primary/20 text-[10px]"
            variant="outline"
          >
            Suggestion {currentStep} / {reviewResult.comments.length}
          </Badge>
          <div className="flex gap-1 justify-end">
            {reviewResult.comments.map((_, i) => (
              <div
                className={`h-1 w-4 rounded-full ${
                  i + 1 < currentStep
                    ? 'bg-green-500'
                    : i + 1 === currentStep
                      ? 'bg-primary animate-pulse'
                      : 'bg-white'
                }`}
                key={i}
              />
            ))}
          </div>
        </div>
        {extra.is_next_step || isStart ? (
          <>
            <p className="text-sm leading-relaxed font-medium">
              {currentReviewResult.title}
            </p>
            <p className="text-sm leading-relaxed ">
              {currentReviewResult.comment}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {currentReviewResult.explanation}
            </p>
          </>
        ) : (
          formatChatMessage(log.gpt_answer)
        )}
        {currentStep < reviewResult.comments.length && isLast && (
          <>
            <Divider className="!my-2" />
            <p className="text-xs pb-2 text-primary/60 italic font-medium">
              Ready to continue?
            </p>
            <Button
              className="w-full text-xs"
              onClick={handleProceed}
              size="sm"
              variant="outline"
            >
              Next Suggestion
              <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </>
        )}
      </>
    ),
    timestamp: dayjs(log.gpt_response_time),
  });
  return messages.map(message => renderChatMessage(message, false));
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
          isMini ? 'text-[13px]' : 'text-sm',
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
