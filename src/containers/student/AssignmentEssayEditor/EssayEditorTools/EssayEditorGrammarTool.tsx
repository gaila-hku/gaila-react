import React, { useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';
import { ArrowRight, CheckCircle, ClipboardList } from 'lucide-react';
import { useMutation } from 'react-query';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxMini from 'containers/common/AIChatBox.tsx/AIChatBoxMini';

import { apiAskGrammarAgent } from 'api/gpt';
import type { GptLog } from 'types/gpt';

interface ChecklistResult {
  score: number;
  mistakes: {
    severity: any;
    description: string;
    original_sentence: string;
    corrected_sentence: string;
  }[];
}

type Props = {
  toolId: number;
  latestResult: GptLog | null;
  getEssayContent: () => string;
};

const EssayEditorGrammarTool = ({
  toolId,
  latestResult,
  getEssayContent,
}: Props) => {
  const { mutateAsync: askGrammarAgent, isLoading: isAgentLoading } =
    useMutation(apiAskGrammarAgent);

  // Dictionary state
  const [grammarResult, setGrammarResult] = useState<ChecklistResult | null>(
    null,
  );

  const handleGrammarCheck = useCallback(async () => {
    const res = await askGrammarAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay: getEssayContent(),
    });
    const result = JSON.parse(res.gpt_answer) as ChecklistResult;
    setGrammarResult(result);
  }, [askGrammarAgent, getEssayContent, toolId]);

  useEffect(() => {
    if (!latestResult) {
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as ChecklistResult;
    setGrammarResult(result);
  }, [latestResult]);

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2 text-base',
        children: 'space-y-3',
        root: '!p-4',
      }}
      collapsible
      defaultCollapsed
      title={
        <>
          <ClipboardList className="h-4 w-4" /> Grammar checker
        </>
      }
    >
      <Button
        className="w-full gap-1 h-auto py-2 text-xs"
        disabled={isAgentLoading}
        onClick={handleGrammarCheck}
        size="sm"
      >
        <CheckCircle className="h-3 w-3" />
        {isAgentLoading ? 'Checking...' : 'Check my grammar'}
      </Button>
      {/* <div className="grid grid-cols-2 gap-2">
        <Button
          className="w-full gap-1 h-auto py-2 flex-col text-xs"
          disabled={isCheckingGrammar}
          onClick={handleCheckGrammar}
          size="sm"
          variant="outline"
        >
          <CheckCircle className="h-3 w-3" />
          Grammar
        </Button>
      </div> */}

      {!!grammarResult && (
        <div className="p-2 border rounded text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium capitalize">Results</h4>
            <Badge
              className="text-xs"
              variant={
                grammarResult.score >= 80
                  ? 'primary'
                  : grammarResult.score >= 60
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {grammarResult.score}%
            </Badge>
          </div>
          <div className="space-y-1">
            {grammarResult.mistakes.map((mistake, idx) => (
              <div
                className={clsx(
                  'border rounded-lg p-2',
                  mistake.severity === 'high'
                    ? 'bg-red-50'
                    : mistake.severity === 'medium'
                      ? 'bg-yellow-50'
                      : 'bg-blue-50',
                )}
                key={idx}
              >
                <p className="text-xs text-muted-foreground mb-2">
                  {mistake.description}
                </p>
                <p className="text-xs text-rose-500">
                  {mistake.original_sentence}
                </p>
                <div className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 mt-[2px] shrink-0" />
                  <p className="text-xs text-green-500">
                    {mistake.corrected_sentence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!!grammarResult && (
        <AIChatBoxMini
          chatMutateFn={apiAskGrammarAgent}
          chatName="Ask Grammar Agent"
          firstMessage="Ask me about specific issues, how to fix them, or how to improve your scores!"
          getEssayContent={getEssayContent}
          toolId={toolId}
        />
      )}
    </Card>
  );
};

export default EssayEditorGrammarTool;
