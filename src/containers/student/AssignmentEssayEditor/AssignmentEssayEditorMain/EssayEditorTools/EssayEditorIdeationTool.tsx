import React, { useCallback, useEffect, useState } from 'react';

import { Languages, Search } from 'lucide-react';
import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';

import { apiAskIdeationAgent } from 'api/gpt';
import type { DictionaryResult, GptLog } from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
};

const EssayEditorIdeationTool = ({ toolId, latestResult }: Props) => {
  const { mutateAsync: askIdeationAgent, isLoading: isAgentLoading } =
    useMutation(apiAskIdeationAgent);

  const [ideationResult, setIdeationResult] = useState<DictionaryResult | null>(
    null,
  );

  const handleIdeationStart = useCallback(async () => {
    const res = await askIdeationAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay: undefined,
    });
    const result = JSON.parse(res.gpt_answer) as DictionaryResult;
    setIdeationResult(result);
  }, [askIdeationAgent, toolId]);

  useEffect(() => {
    if (!latestResult) {
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as DictionaryResult;
    setIdeationResult(result);
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
          <Languages className="h-4 w-4" />
          Dictionary
        </>
      }
    >
      <Button
        className="w-full gap-2"
        disabled={isAgentLoading}
        onClick={handleIdeationStart}
        size="sm"
      >
        <Search className="h-4 w-4" />
        {isAgentLoading ? 'Searching...' : 'Search'}
      </Button>

      {ideationResult && (
        <div className="space-y-2 p-3 bg-secondary rounded-lg text-xs">
          <div>
            <h4 className="font-semibold">
              {ideationResult.original_word}{' '}
              <span className="text-muted-foreground italic">
                ({ideationResult.parts_of_speech})
              </span>
            </h4>
          </div>
          <div>
            <p className="font-medium">Translation: </p>
            <p className="text-muted-foreground">
              {ideationResult.translation}
            </p>
          </div>
          <div>
            <p className="font-medium">Definition:</p>
            <p className="text-muted-foreground">{ideationResult.definition}</p>
          </div>
          <div>
            <p className="font-medium mb-1">Examples:</p>
            <ul className="space-y-1">
              {ideationResult.examples.map((example, idx) => (
                <li
                  className="text-muted-foreground pl-2 border-l-2 border-primary"
                  key={idx}
                >
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {ideationResult && (
        <AIChatBoxMini
          chatMutateFn={apiAskIdeationAgent}
          chatName="Ask Ideation Agent"
          firstMessage=""
          toolId={toolId}
        />
      )}
    </Card>
  );
};

export default EssayEditorIdeationTool;
