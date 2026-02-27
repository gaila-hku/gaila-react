import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Bot, Sparkles } from 'lucide-react';
import { useMutation } from 'react-query';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';

import { apiAskAutogradeAgent } from 'api/gpt';
import type { AutoGradeResult, GptLog } from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
  essay: string;
};

const EssayEditorAutoGradeTool = ({ toolId, latestResult, essay }: Props) => {
  const { mutateAsync: askAutogradeAgent, isLoading: isAgentLoading } =
    useMutation(apiAskAutogradeAgent);

  // Dictionary state
  const [autogradeResult, setAutogradeResult] =
    useState<AutoGradeResult | null>(null);

  const handleAutogradeCheck = useCallback(async () => {
    const res = await askAutogradeAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay,
    });
    const result = JSON.parse(res.gpt_answer) as AutoGradeResult;
    setAutogradeResult(result);
  }, [askAutogradeAgent, essay, toolId]);

  useEffect(() => {
    if (!latestResult) {
      setAutogradeResult(null);
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as AutoGradeResult;
    setAutogradeResult(result);
  }, [latestResult]);

  const [overallScore, maxScore, scoreRatio] = useMemo(() => {
    if (!autogradeResult) {
      return [null, null, 0];
    }
    const overallScore = autogradeResult.criteria_scores.reduce(
      (sum, item) => sum + (item.score || 0),
      0,
    );
    const maxScore = autogradeResult.criteria_scores.reduce(
      (sum, item) => sum + (item.max_score || 0),
      0,
    );
    if (maxScore === 0 || overallScore === 0) {
      return [null, null, 0];
    }
    return [overallScore, maxScore, (overallScore / maxScore) * 100];
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
            {overallScore !== null && (
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Overall Score
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {overallScore}
                    <span className="text-sm">/{maxScore}</span>
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
            )}

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
                    {criterion.score !== null && (
                      <Badge className="text-xs" variant="outline">
                        {criterion.score}/{criterion.max_score}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
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
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {autogradeResult.overall_feedback}
              </p>
            </div>
          </div>
        </div>
      )}
      {!!autogradeResult && (
        <AIChatBoxProvider
          chatMutateFn={apiAskAutogradeAgent}
          essay={essay}
          toolId={toolId}
        >
          <AIChatBoxMini
            chatName="Ask Autograde Agent"
            firstMessage="Ask me about your scores, how to improve specific criteria, or clarify feedback!"
          />
        </AIChatBoxProvider>
      )}
    </Card>
  );
};

export default EssayEditorAutoGradeTool;
