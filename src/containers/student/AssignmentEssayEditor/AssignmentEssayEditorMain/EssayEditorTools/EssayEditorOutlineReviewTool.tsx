import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import dayjs from 'dayjs';
import { isNumber } from 'lodash-es';
import { Edit, FilePen, Send } from 'lucide-react';
import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import ErrorMessage from 'components/display/ErrorMessage';
import useInfiniteListing from 'components/display/InfiniteList/useInfiniteListing';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import LoadingMessage from 'containers/common/AIChatBox/LoadingMessage';
import {
  type ChatMessage,
  renderChatMessage,
  renderOutlineReviewLog,
} from 'containers/common/AIChatBox/utils';
import useAlert from 'containers/common/AlertProvider/useAlert';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiAskOutlineReviewAgent, apiGetGptChatLogs } from 'api/gpt';
import type { GptLog, OutlineReviewResult } from 'types/gpt';
import safeJsonParse from 'utils/helper/safeJSONparse';
import tuple from 'utils/types/tuple';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
};

export const getProceedQuestion = (step: number) => {
  return `Proceed to item ${step}`;
};

const EssayEditorOutlineReviewTool = ({ toolId, latestResult }: Props) => {
  const { alertMsg } = useAlert();
  const { outline } = useAssignmentEssayEditorProvider();
  const { mutateAsync: askReviewAgent, isLoading: isAgentLoading } =
    useMutation(apiAskOutlineReviewAgent);

  const [outlineReviewResult, setOutlineReviewResult] =
    useState<OutlineReviewResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [chatInput, setChatInput] = useState('');
  const [newChatMessages, setNewChatMessages] = useState<
    (ChatMessage | GptLog)[]
  >([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    data: apiMessages,
    isLoading,
    endReached,
    setPages,
    setPageLimit,
    error,
  } = useInfiniteListing<GptLog>({
    queryFn: apiGetGptChatLogs,
    queryKey: tuple([
      apiGetGptChatLogs.queryKey,
      {
        assignment_tool_id: toolId,
        page: 1,
        limit: 10,
        include_structured: true,
      },
    ]),
    pageLimit: 1,
  });

  const dataInit = useRef(false);
  useEffect(() => {
    if (!apiMessages.length || !latestResult || dataInit.current) {
      return;
    }
    const result = safeJsonParse(
      latestResult.gpt_answer,
    ) as OutlineReviewResult;
    setOutlineReviewResult(result);

    const extra = safeJsonParse(apiMessages[0].extra) as {
      current_step: number;
    };
    const latestStep = isNumber(extra.current_step) ? extra.current_step : 1;
    setCurrentStep(latestStep);
    dataInit.current = true;
  }, [apiMessages, latestResult]);

  const handleProceed = useCallback(async () => {
    if (!outlineReviewResult) {
      return;
    }
    const nextStep = Math.min(
      outlineReviewResult.comments.length,
      currentStep + 1,
    );
    const userMessageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: getProceedQuestion(nextStep),
      timestamp: dayjs(),
    };

    setNewChatMessages(prev => [...prev, userMessage]);

    const res = await askReviewAgent({
      question: getProceedQuestion(nextStep),
      assignment_tool_id: toolId,
      outline,
      is_structured: false,
      extra: JSON.stringify({ current_step: nextStep, is_next_step: true }),
    });
    setNewChatMessages(prev => {
      return prev.filter(m => m.id !== userMessageId).concat(res);
    });
    setCurrentStep(nextStep);
  }, [askReviewAgent, currentStep, outline, outlineReviewResult, toolId]);

  const displayMessages = useMemo(() => {
    const allMessages: React.ReactNode[] = [];

    if (apiMessages.length) {
      const logs = Array.from(apiMessages).reverse();
      allMessages.push(
        ...logs.map((log, index) =>
          renderOutlineReviewLog(
            log,
            outlineReviewResult,
            handleProceed,
            index === logs.length - 1 && !newChatMessages.length,
          ),
        ),
      );
    }

    if (newChatMessages.length) {
      allMessages.push(
        ...newChatMessages.map((message, index) => {
          if ('role' in message) {
            return renderChatMessage(message);
          }
          return renderOutlineReviewLog(
            message,
            outlineReviewResult,
            handleProceed,
            index === newChatMessages.length - 1,
          );
        }),
      );
    }

    return allMessages;
  }, [apiMessages, handleProceed, newChatMessages, outlineReviewResult]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [apiMessages, newChatMessages, isAgentLoading]);

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

  const handleOutlineReview = useCallback(async () => {
    if (!outline) {
      alertMsg('Please write an outline first.');
      return;
    }
    const res = await askReviewAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      outline,
      extra: JSON.stringify({ current_step: 1, is_next_step: false }),
    });
    setNewChatMessages(prev => [...prev, res]);
  }, [alertMsg, askReviewAgent, outline, toolId]);

  const handleSendMessage = useCallback(
    async (inputQuestion?: string) => {
      const question = inputQuestion || chatInput;
      if (!question.trim()) {
        return;
      }
      const userMessageId = Date.now().toString();
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: question,
        timestamp: dayjs(),
      };

      setNewChatMessages(prev => [...prev, userMessage]);
      setChatInput('');

      const res = await askReviewAgent({
        question: question,
        assignment_tool_id: toolId,
        outline,
        is_structured: false,
        extra: JSON.stringify({
          current_step: currentStep,
          is_next_step: false,
        }),
      });
      setNewChatMessages(prev => {
        return prev.filter(m => m.id !== userMessageId).concat(res);
      });
    },
    [askReviewAgent, chatInput, currentStep, outline, toolId],
  );

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2 text-base',
        root: '!p-4',
      }}
      collapsible
      defaultCollapsed
      maxHeightUncollapsed={2000}
      title={
        <>
          <FilePen className="h-4 w-4" />
          Outline Refine Agent
        </>
      }
    >
      {!!apiMessages.length && (
        <>
          <div
            className="max-h-[320px] overflow-y-auto space-y-4"
            ref={chatScrollRef}
          >
            {isLoading && <Loading />}
            {displayMessages}
            {isAgentLoading && <LoadingMessage />}
          </div>

          <ErrorMessage error={error} />

          <div className="py-3 border-t flex gap-2">
            <TextInput
              className="text-sm"
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything..."
              value={chatInput}
            />
            <Button
              disabled={!chatInput.trim() || isAgentLoading}
              onClick={() => handleSendMessage()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      <Button
        className="w-full gap-2"
        disabled={isAgentLoading}
        onClick={handleOutlineReview}
        size="sm"
        variant={apiMessages.length ? 'secondary' : 'default'}
      >
        <Edit className="h-4 w-4" />
        {isAgentLoading
          ? 'Reviewing...'
          : apiMessages.length
            ? 'Restart Review'
            : 'Advice to Refine Ideas'}
      </Button>
    </Card>
  );
};

export default EssayEditorOutlineReviewTool;
