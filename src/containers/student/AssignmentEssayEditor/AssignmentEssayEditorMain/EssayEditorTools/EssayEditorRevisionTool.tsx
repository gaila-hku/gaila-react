import React, { useCallback, useEffect, useState } from 'react';

import { ArrowRight, CheckCircle, ClipboardList } from 'lucide-react';
import { useMutation } from 'react-query';

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

  // TODO: finish this function
  // TODO: add explanation input, database
  const handleApplyRevision = useCallback(
    (suggestions: RevisionResult['revision_items'][number]['suggestions']) => {
      console.log(suggestions);
    },
    [],
  );

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2 text-base',
        children: 'space-y-3',
        root: '!p-4',
      }}
      collapsible
      defaultCollapsed
      maxHeightUncollapsed={3000}
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
        <div className="space-y-1">
          {revisionResult.revision_items.map(item => (
            <div className="border rounded-lg p-2" key={item.aspect_id}>
              <h4 className="font-medium">{item.aspect_title}</h4>
              {item.suggestions.map((chunk, index) => (
                <React.Fragment key={index}>
                  <p className="text-xs text-rose-500">{chunk.current_text}</p>
                  <div className="flex items-start gap-1">
                    <ArrowRight className="h-3 w-3 mt-[2px] shrink-0" />
                    <p className="text-xs text-green-500">
                      {chunk.replace_text}
                    </p>
                  </div>
                </React.Fragment>
              ))}
              <div className="text-xs mt-2">{item.explanation}</div>
              <Button
                className="w-full mt-2"
                onClick={() => handleApplyRevision(item.suggestions)}
              >
                Apply
              </Button>
            </div>
          ))}
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
