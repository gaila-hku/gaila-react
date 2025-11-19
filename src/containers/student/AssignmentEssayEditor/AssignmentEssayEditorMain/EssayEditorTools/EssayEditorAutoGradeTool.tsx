import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Bot, Sparkles } from 'lucide-react';
import { useMutation } from 'react-query';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';

import { apiAskAutogradeAgent } from 'api/gpt';
import type { AutoGradeResult, GptLog } from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
  getEssayContent: () => string;
};

const EssayEditorAutoGradeTool = ({
  toolId,
  latestResult,
  getEssayContent,
}: Props) => {
  const { mutateAsync: askAutogradeAgent, isLoading: isAgentLoading } =
    useMutation(apiAskAutogradeAgent);

  // Dictionary state
  const [autogradeResult, setAutogradeResult] =
    useState<AutoGradeResult | null>(null);

  const handleAutogradeCheck = useCallback(async () => {
    const res = await askAutogradeAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay: getEssayContent(),
    });
    const result = JSON.parse(res.gpt_answer) as AutoGradeResult;
    setAutogradeResult(result);
  }, [askAutogradeAgent, getEssayContent, toolId]);

  useEffect(() => {
    if (!latestResult) {
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as AutoGradeResult;
    setAutogradeResult(result);
  }, [latestResult]);

  const scoreRatio = useMemo(() => {
    if (!autogradeResult) {
      return 0;
    }
    return (autogradeResult.overall_score / autogradeResult.max_score) * 100;
  }, [autogradeResult]);

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
          <Sparkles className="h-4 w-4" /> AI Auto Grading
        </>
      }
    >
      <Button
        className="w-full gap-2"
        disabled={isAgentLoading}
        onClick={handleAutogradeCheck}
        size="sm"
      >
        <Sparkles className="h-4 w-4" />
        {isAgentLoading ? 'Grading...' : 'Grade My Essay'}
      </Button>

      {autogradeResult && (
        <div className="max-h-[400px] overflow-auto">
          <div className="space-y-3 pr-4">
            {/* Overall Score */}
            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Overall Score
                </p>
                <p className="text-2xl font-bold text-primary">
                  {autogradeResult.overall_score}
                  <span className="text-sm">/{autogradeResult.max_score}</span>
                </p>
                <Badge
                  className="mt-2 text-xs"
                  variant={
                    scoreRatio >= 80
                      ? 'primary'
                      : scoreRatio >= 60
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {scoreRatio >= 80
                    ? 'Excellent'
                    : scoreRatio >= 60
                      ? 'Good'
                      : 'Needs Improvement'}
                </Badge>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold">Score Breakdown</h4>
              {autogradeResult.criteria_scores.map((criterion, idx) => (
                <div
                  className="p-2 border rounded text-xs space-y-1.5"
                  key={idx}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{criterion.criteria}</span>
                    <Badge className="text-xs" variant="outline">
                      {criterion.score}/{criterion.max_score}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {criterion.feedback}
                  </p>
                </div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="p-2 bg-secondary rounded text-xs">
              <h4 className="font-semibold mb-1.5 flex items-center gap-1">
                <Bot className="h-3 w-3" />
                Overall Feedback
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {autogradeResult.overall_feedback}
              </p>
            </div>
          </div>
        </div>
      )}
      {!!autogradeResult && (
        <AIChatBoxMini
          chatMutateFn={apiAskAutogradeAgent}
          chatName="Ask Autograde Agent"
          firstMessage="Ask me about your scores, how to improve specific criteria, or clarify feedback!"
          getEssayContent={getEssayContent}
          toolId={toolId}
        />
      )}
    </Card>
  );
};

export default EssayEditorAutoGradeTool;
