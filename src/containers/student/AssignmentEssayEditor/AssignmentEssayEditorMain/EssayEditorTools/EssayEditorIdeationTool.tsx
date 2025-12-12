import React, { useCallback, useEffect, useState } from 'react';

import { CheckCircle, Lightbulb, Sparkles } from 'lucide-react';
import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';
import useAlert from 'containers/common/AlertProvider/useAlert';

import { apiAskIdeationAgent } from 'api/gpt';
import type {
  GptLog,
  IdeationIdeaResult,
  IdeationScaffoldResult,
} from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
};

const EssayEditorIdeationTool = ({ toolId, latestResult }: Props) => {
  const { alertMsg } = useAlert();
  const { mutateAsync: askIdeationAgent, isLoading: isAgentLoading } =
    useMutation(apiAskIdeationAgent);

  const [ideationScaffoldResult, setIdeationScaffoldResult] =
    useState<IdeationScaffoldResult | null>(null);
  const [ideationAnswers, setIdeationAnswers] = useState<
    Record<string, string>
  >({});
  const [ideationResult, setIdeationResult] =
    useState<IdeationIdeaResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIdeationStart = useCallback(async () => {
    const res = await askIdeationAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay: undefined,
      ideation_stage: 1,
    });
    const result = JSON.parse(res.gpt_answer) as IdeationScaffoldResult;
    setIdeationScaffoldResult(result);
    setIdeationResult(null);
  }, [askIdeationAgent, toolId]);

  const handleIdeationAnswerChange = useCallback(
    (heading: string, value: string) => {
      setIdeationAnswers(prev => ({
        ...prev,
        [heading]: value,
      }));
    },
    [],
  );

  const handleIdeationSubmit = useCallback(async () => {
    if (Object.values(ideationAnswers).every(v => !v)) {
      alertMsg('Please answer the questions');
      return;
    }
    setIsSubmitting(true);
    const res = await askIdeationAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay: undefined,
      ideation_stage: 2,
      question: JSON.stringify(ideationAnswers),
    });
    setIsSubmitting(false);
    const result = JSON.parse(res.gpt_answer) as IdeationIdeaResult;
    setIdeationResult(result);
  }, [alertMsg, askIdeationAgent, ideationAnswers, toolId]);

  useEffect(() => {
    if (!latestResult) {
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as
      | IdeationScaffoldResult
      | IdeationIdeaResult;
    if ('idea_scaffolds' in result) {
      setIdeationScaffoldResult(result);
    } else {
      setIdeationResult(result);
    }
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
          Ideation
        </>
      }
    >
      {!ideationScaffoldResult && !ideationResult && (
        <Button
          className="w-full gap-2"
          disabled={isAgentLoading}
          onClick={handleIdeationStart}
          size="sm"
        >
          <Sparkles className="h-4 w-4" />
          {isAgentLoading ? 'Starting...' : 'Start Ideation'}
        </Button>
      )}

      {ideationScaffoldResult && !ideationResult && (
        <div className="space-y-2 p-3 bg-secondary rounded-lg">
          {ideationScaffoldResult.idea_scaffolds.map((scaffold, index) => (
            <div key={index}>
              <p className="font-semibold text-sm">{scaffold.heading}</p>
              <p className="text-sm">{scaffold.question}</p>
              <TextInput
                onChange={e =>
                  handleIdeationAnswerChange(scaffold.heading, e.target.value)
                }
                placeholder="Input your answer..."
                size="xs"
              />
            </div>
          ))}
          <Button
            className="w-full gap-2"
            disabled={isAgentLoading}
            onClick={handleIdeationSubmit}
            size="sm"
          >
            <CheckCircle />
            {isAgentLoading && isSubmitting
              ? 'Generating...'
              : 'Generate Outline'}
          </Button>
          <Button
            className="w-full"
            disabled={isAgentLoading}
            onClick={handleIdeationStart}
            size="sm"
            variant="outline"
          >
            {isAgentLoading && !isSubmitting
              ? 'Loading...'
              : 'Regenerate Questions'}
          </Button>
        </div>
      )}

      {ideationResult && (
        <div className="space-y-2 p-3 bg-secondary rounded-lg text-xs">
          {ideationResult.sections.map((section, index) => (
            <div key={index}>
              <p className="font-semibold text-sm">{section.title}</p>
              {section.content.map((content, idx) => (
                <div className="flex gap-2 items-start" key={`${index}-${idx}`}>
                  <div className="w-1 h-1 bg-black rounded-full relative top-2" />
                  <p className="flex-1 text-sm">{content}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Note: {section.notes}
              </p>
            </div>
          ))}
          <Button
            className="w-full gap-2"
            disabled={isAgentLoading}
            onClick={handleIdeationStart}
            size="sm"
            variant="outline"
          >
            {isAgentLoading ? 'Starting...' : 'Restart Ideation'}
          </Button>
        </div>
      )}

      {(ideationResult || ideationScaffoldResult) && (
        <AIChatBoxMini
          chatMutateFn={apiAskIdeationAgent}
          chatName="Ask Ideation Agent"
          firstMessage="Ask me about the generated outline, or questions about starting the essay!"
          toolId={toolId}
        />
      )}
    </Card>
  );
};

export default EssayEditorIdeationTool;
