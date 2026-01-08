import React, { useCallback, useEffect, useState } from 'react';

import { Edit, FilePenLine } from 'lucide-react';
import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';
import useAlert from 'containers/common/AlertProvider/useAlert';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiAskOutlineReviewAgent } from 'api/gpt';
import type { GptLog, OutlineReviewResult } from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
};

const EssayEditorOutlineReviewTool = ({ toolId, latestResult }: Props) => {
  const { alertMsg } = useAlert();
  const { outline } = useAssignmentEssayEditorProvider();
  const { mutateAsync: askReviewAgent, isLoading: isAgentLoading } =
    useMutation(apiAskOutlineReviewAgent);

  const [ideationReviewResult, setIdeationReviewResult] =
    useState<OutlineReviewResult | null>(null);

  const handleOutlineReview = useCallback(async () => {
    if (!outline) {
      alertMsg('Please write an outline first.');
      return;
    }
    const res = await askReviewAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay: outline,
    });
    const result = JSON.parse(res.gpt_answer) as OutlineReviewResult;
    setIdeationReviewResult(result);
  }, [alertMsg, askReviewAgent, outline, toolId]);

  useEffect(() => {
    if (!latestResult) {
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as OutlineReviewResult;
    setIdeationReviewResult(result);
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
          <FilePenLine className="h-4 w-4" />
          Outline Review Agent
        </>
      }
    >
      <Button
        className="w-full gap-2"
        disabled={isAgentLoading}
        onClick={handleOutlineReview}
        size="sm"
      >
        <Edit className="h-4 w-4" />
        {isAgentLoading ? 'Reviewing...' : 'Review Outline'}
      </Button>
      {ideationReviewResult && (
        <div className="p-3 bg-secondary rounded-lg text-xs">
          {ideationReviewResult.comments.map((item, index) => (
            <div
              className="not-last:border-b not-last:pb-2 not-last:mb-2"
              key={index}
            >
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-xs">{item.comment}</p>
              <p className="text-xs">Explanation: {item.explanation}</p>
            </div>
          ))}
        </div>
      )}
      {ideationReviewResult && (
        <AIChatBoxMini
          chatMutateFn={apiAskOutlineReviewAgent}
          chatName="Ask Reviewing Agent"
          firstMessage="Ask me about the outline comments!"
          toolId={toolId}
        />
      )}
    </Card>
  );
};

export default EssayEditorOutlineReviewTool;
