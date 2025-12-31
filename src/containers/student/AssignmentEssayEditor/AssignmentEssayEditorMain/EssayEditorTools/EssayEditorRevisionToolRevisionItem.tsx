import React, { useCallback, useState } from 'react';

import { ArrowRight } from 'lucide-react';
import { useMutation } from 'react-query';

import Divider from 'components/display/Divider';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiSubmitRevisionExplanation } from 'api/gpt';
import type { RevisionResult, StudentRevisionExplanation } from 'types/gpt';

type Props = {
  revisionLogId: number;
  revisionItem: RevisionResult['revision_items'][number];
  refetchExplanations: () => void;
  explanationItem: StudentRevisionExplanation | null;
  isExplanationLoading: boolean;
};

const EssayEditorRevisionToolRevisionItem = ({
  revisionLogId,
  revisionItem,
  refetchExplanations,
  explanationItem,
  isExplanationLoading,
}: Props) => {
  const { assignment, essay, setEssay } = useAssignmentEssayEditorProvider();
  const isRevisionAskExplanation =
    assignment?.config?.revision_tool_ask_explanation ?? false;

  const [explanation, setExplanation] = useState('');

  const { mutateAsync: submitExplanation, isLoading: isSubmitting } =
    useMutation(apiSubmitRevisionExplanation, {
      onSuccess: () => {
        refetchExplanations();
      },
    });

  const applyRevision = useCallback(
    (suggestions: RevisionResult['revision_items'][number]['suggestions']) => {
      let newEssay = essay;
      suggestions.forEach(suggestion => {
        newEssay = newEssay.replace(
          suggestion.current_text,
          suggestion.replace_text,
        );
      });
      setEssay(newEssay);
    },
    [essay, setEssay],
  );

  const handleAcceptRevision = useCallback(
    async (revisionItem: RevisionResult['revision_items'][number]) => {
      const aspectId = revisionItem.aspect_id;
      await submitExplanation({
        gpt_log_id: revisionLogId,
        aspect_id: aspectId,
        response_type: 'agree',
        ...(isRevisionAskExplanation ? { explanation } : {}),
      });
      applyRevision(revisionItem.suggestions);
    },
    [
      submitExplanation,
      revisionLogId,
      isRevisionAskExplanation,
      explanation,
      applyRevision,
    ],
  );

  const handleRejectRevision = useCallback(
    async (revisionItem: RevisionResult['revision_items'][number]) => {
      const aspectId = revisionItem.aspect_id;
      await submitExplanation({
        gpt_log_id: revisionLogId,
        aspect_id: aspectId,
        response_type: 'disagree',
        ...(isRevisionAskExplanation ? { explanation } : {}),
      });
    },
    [submitExplanation, revisionLogId, isRevisionAskExplanation, explanation],
  );

  return (
    <div className="border rounded-lg p-2" key={revisionItem.aspect_id}>
      <h4 className="font-medium">{revisionItem.aspect_title}</h4>
      {revisionItem.suggestions.map((chunk, index) => (
        <React.Fragment key={index}>
          <p className="text-xs text-rose-500">{chunk.current_text}</p>
          <div className="flex items-start gap-1">
            <ArrowRight className="h-3 w-3 mt-[2px] shrink-0" />
            <p className="text-xs text-green-500">{chunk.replace_text}</p>
          </div>
        </React.Fragment>
      ))}
      <Divider className="!my-2" />
      {isExplanationLoading ? (
        <Loading />
      ) : explanationItem ? (
        <>
          <p className="text-xs mb-1">
            You have already{' '}
            {explanationItem.response_type === 'agree'
              ? 'accepted'
              : 'rejected'}{' '}
            the change!
          </p>{' '}
          <p className="text-xs">Explanation: {explanationItem.explanation}</p>
        </>
      ) : isRevisionAskExplanation ? (
        <>
          <div className="text-xs mb-2">
            AI proposed this fix. Do you agree with the change? What do you
            think the explanation is?
          </div>
          <TextInput
            onChange={e => setExplanation(e.target.value)}
            placeholder="e.g. Past tense, missing prepositions"
            size="xs"
            value={explanation}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              disabled={!explanation}
              loading={isSubmitting}
              onClick={() => handleRejectRevision(revisionItem)}
              size="sm"
              variant="ghost"
            >
              Reject
            </Button>
            <Button
              disabled={!explanation}
              loading={isSubmitting}
              onClick={() => handleAcceptRevision(revisionItem)}
              size="sm"
            >
              Apply Changes
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-xs mt-2">{revisionItem.explanation}</div>
          <Button
            className="w-full mt-2"
            loading={isSubmitting}
            onClick={() => handleAcceptRevision(revisionItem)}
          >
            Apply
          </Button>
        </>
      )}
    </div>
  );
};

export default EssayEditorRevisionToolRevisionItem;
