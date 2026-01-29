import React, { useCallback, useEffect, useState } from 'react';

import { CheckCircle, ClipboardList } from 'lucide-react';
import { useMutation, useQuery } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';

import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';
import EssayEditorRevisionToolRevisionItem from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorRevisionToolRevisionItem';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiAskRevisionAgent, apiGetRevisionExplanations } from 'api/gpt';
import type { GptLog, RevisionResult } from 'types/gpt';
import tuple from 'utils/types/tuple';

type Props = {
  toolId: number;
  latestLog: GptLog | null;
  essay: string;
};

const EssayEditorRevisionTool = ({ toolId, latestLog, essay }: Props) => {
  const { currentStage } = useAssignmentSubmissionProvider();
  const { readonly } = useAssignmentEssayEditorProvider();

  const isRevisionAskExplanation =
    (currentStage?.stage_type === 'revising' &&
      currentStage.config.revision_tool_ask_explanation) ||
    false;

  const { mutateAsync: askRevisionAgent, isLoading: isAgentLoading } =
    useMutation(apiAskRevisionAgent);

  const [revisionLog, setRevisionLog] = useState<GptLog | null>(null);
  const revisionResult = revisionLog
    ? (JSON.parse(revisionLog.gpt_answer) as RevisionResult)
    : null;

  const {
    data: explanationData,
    isLoading: isExplanationLoading,
    refetch: fetchRevisionExplanations,
  } = useQuery(
    tuple([
      apiGetRevisionExplanations.queryKey,
      {
        gpt_log_ids:
          revisionResult?.revision_items.map(_ => revisionLog?.id || -1) || [],
        aspect_ids:
          revisionResult?.revision_items.map(item => item.aspect_id) || [],
      },
    ]),
    apiGetRevisionExplanations,
    { enabled: !!revisionResult },
  );

  const handleRevisionCheck = useCallback(async () => {
    const res = await askRevisionAgent({
      assignment_tool_id: toolId,
      is_structured: true,
      essay,
    });
    setRevisionLog(res);
  }, [askRevisionAgent, essay, toolId]);

  useEffect(() => {
    if (!latestLog) {
      setRevisionLog(null);
      return;
    }
    setRevisionLog(latestLog);
  }, [latestLog]);

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2 text-base',
        children: 'space-y-2',
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
        <div className="space-y-2">
          {isRevisionAskExplanation && (
            <ul className="text-xs list-disc list-outside pl-3 space-y-1">
              <li>
                AI has proposed the following revisions. For each item, tell us
                if you agree with the suggestion
              </li>
              <li>
                If you agree, think about why AI suggested the change. If not,
                tell us why you disagree
              </li>
              {readonly ? (
                <li className="text-rose-400">
                  This assignment is currently readonly. You can no longer apply
                  changes, but you may still submit your reaonsing.
                </li>
              ) : (
                <li>
                  You can apply or reject the changes in one click after giving
                  your reason
                </li>
              )}
            </ul>
          )}
          {revisionResult.revision_items.map(item => (
            <EssayEditorRevisionToolRevisionItem
              explanationItem={
                explanationData?.find(
                  explanationItem =>
                    explanationItem.aspect_id === item.aspect_id,
                ) || null
              }
              isExplanationLoading={isExplanationLoading}
              isRevisionAskExplanation={isRevisionAskExplanation}
              key={item.aspect_id}
              refetchExplanations={fetchRevisionExplanations}
              revisionItem={item}
              revisionLogId={revisionLog?.id || -1}
            />
          ))}
        </div>
      )}

      {!!revisionResult && (
        <AIChatBoxProvider
          chatMutateFn={apiAskRevisionAgent}
          essay={essay}
          toolId={toolId}
        >
          <AIChatBoxMini
            chatName="Ask Revision Agent"
            firstMessage="Ask me about specific issues, how to fix them, or how to improve your essay!"
          />
        </AIChatBoxProvider>
      )}
    </Card>
  );
};

export default EssayEditorRevisionTool;
