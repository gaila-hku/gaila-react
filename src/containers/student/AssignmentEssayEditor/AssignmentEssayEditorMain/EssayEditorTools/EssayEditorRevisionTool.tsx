import React, { useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';
import { ArrowRight, CheckCircle, ClipboardList } from 'lucide-react';
import { useMutation } from 'react-query';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';

import { apiAskRevisionAgent } from 'api/gpt';
import type { GptLog, RevisionResult } from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
  essay: string;
};

const EssayEditorRevisionTool = ({ toolId, latestResult, essay }: Props) => {
  const { mutateAsync: askRevisionAgent, isLoading: isAgentLoading } =
    useMutation(apiAskRevisionAgent);

  const [revisionResult, setRevisionResult] = useState<RevisionResult | null>(
    null,
  );

  const handleRevisionCheck = useCallback(async () => {
    const res = await askRevisionAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay,
    });
    const result = JSON.parse(res.gpt_answer) as RevisionResult;
    setRevisionResult(result);
  }, [askRevisionAgent, essay, toolId]);

  useEffect(() => {
    if (!latestResult) {
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as RevisionResult;
    setRevisionResult(result);
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
          <ClipboardList className="h-4 w-4" /> AI Revision
        </>
      }
    >
      <Button
        className="w-full gap-1 h-auto py-2 text-xs"
        disabled={isAgentLoading}
        onClick={handleRevisionCheck}
        size="sm"
      >
        <CheckCircle className="h-3 w-3" />
        {isAgentLoading ? 'Revising...' : 'Revise my essay'}
      </Button>

      {!!revisionResult && (
        <div className="p-2 border rounded text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium capitalize">Results</h4>
            <Badge
              className="text-xs"
              variant={
                revisionResult.score >= 80
                  ? 'primary'
                  : revisionResult.score >= 60
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {revisionResult.score}%
            </Badge>
          </div>
          <div className="space-y-1">
            {revisionResult.mistakes.map((mistake, idx) => (
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

      {!!revisionResult && (
        <AIChatBoxMini
          chatMutateFn={apiAskRevisionAgent}
          chatName="Ask Revision Agent"
          essay={essay}
          firstMessage="Ask me about specific issues, how to fix them, or how to improve your essay!"
          toolId={toolId}
        />
      )}
    </Card>
  );
};

export default EssayEditorRevisionTool;
