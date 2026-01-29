import React, { useCallback, useEffect, useState } from 'react';

import { Lightbulb, Sparkles } from 'lucide-react';
import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiAskIdeationGuidingAgent } from 'api/gpt';
import type { GptLog, IdeationScaffoldResult } from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
};

const EssayEditorIdeationGuidingTool = ({ toolId, latestResult }: Props) => {
  const { outline } = useAssignmentEssayEditorProvider();
  const { mutateAsync: askIdeationAgent, isLoading: isAgentLoading } =
    useMutation(apiAskIdeationGuidingAgent);

  const [ideationScaffoldResult, setIdeationScaffoldResult] =
    useState<IdeationScaffoldResult | null>(null);

  const handleGenerateGuidingQuestions = useCallback(async () => {
    const res = await askIdeationAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay: outline,
    });
    const result = JSON.parse(res.gpt_answer) as IdeationScaffoldResult;
    setIdeationScaffoldResult(result);
  }, [askIdeationAgent, outline, toolId]);

  useEffect(() => {
    if (!latestResult) {
      setIdeationScaffoldResult(null);
      return;
    }
    const result = JSON.parse(
      latestResult.gpt_answer,
    ) as IdeationScaffoldResult;
    setIdeationScaffoldResult(result);
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
      maxHeightUncollapsed={2000}
      title={
        <>
          <Lightbulb className="h-4 w-4" />
          Ideation Agent
        </>
      }
    >
      <Button
        className="w-full gap-2"
        disabled={isAgentLoading}
        onClick={handleGenerateGuidingQuestions}
        size="sm"
      >
        <Sparkles className="h-4 w-4" />
        {isAgentLoading
          ? 'Generating...'
          : ideationScaffoldResult
            ? 'Regenerate Questions'
            : 'Generate Ideation Questions'}
      </Button>
      {ideationScaffoldResult && (
        <div className="space-y-2 p-3 bg-secondary rounded-lg">
          {ideationScaffoldResult.idea_scaffolds.map((scaffold, index) => (
            <div key={index}>
              <p className="font-semibold text-sm">{scaffold.heading}</p>
              <p className="text-sm">{scaffold.question}</p>
            </div>
          ))}
        </div>
      )}
      {ideationScaffoldResult && (
        <AIChatBoxProvider
          chatMutateFn={apiAskIdeationGuidingAgent}
          toolId={toolId}
        >
          <AIChatBoxMini
            chatName="Ask Ideation Agent"
            firstMessage="Ask me about the generated questions, or how to use them!"
          />
        </AIChatBoxProvider>
      )}
    </Card>
  );
};

export default EssayEditorIdeationGuidingTool;
