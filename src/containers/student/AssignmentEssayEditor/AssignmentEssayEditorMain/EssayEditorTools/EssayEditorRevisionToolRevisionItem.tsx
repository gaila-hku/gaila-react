import React, { type SetStateAction, useCallback, useState } from 'react';

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
  isRevisionAskExplanation: boolean;
  setCurrentLogIndex?: React.Dispatch<SetStateAction<number>>;
  isLast?: boolean;
};

const EssayEditorRevisionToolRevisionItem = ({
  revisionLogId,
  revisionItem,
  refetchExplanations,
  explanationItem,
  isExplanationLoading,
  isRevisionAskExplanation,
  setCurrentLogIndex,
  isLast,
}: Props) => {
  const { essay, setEssay, readonly } = useAssignmentEssayEditorProvider();

  const [agreeing, setAgreeing] = useState(false);
  const [explanation, setExplanation] = useState('');

  const { mutateAsync: submitExplanation, isLoading: isSubmitting } =
    useMutation(apiSubmitRevisionExplanation, {
      onSuccess: () => {
        refetchExplanations();
      },
    });

  // const applyRevision = useCallback(
  //   (suggestions: RevisionResult['revision_items'][number]['suggestions']) => {
  //     let newEssay = essay;
  //     suggestions.forEach(suggestion => {
  //       newEssay = newEssay.replace(
  //         suggestion.current_text,
  //         suggestion.replace_text,
  //       );
  //     });
  //     setEssay(newEssay);
  //   },
  //   [essay, setEssay],
  // );

  const handleSubmitExplanation = useCallback(
    async (revisionItem: RevisionResult['revision_items'][number]) => {
      const aspectId = revisionItem.aspect_id;
      await submitExplanation({
        gpt_log_id: revisionLogId,
        aspect_id: aspectId,
        response_type: agreeing ? 'agree' : 'disagree',
        ...(isRevisionAskExplanation ? { explanation } : {}),
      });
      // applyRevision(revisionItem.suggestions);
      setCurrentLogIndex?.(s => s + 1);
    },
    [
      submitExplanation,
      revisionLogId,
      agreeing,
      isRevisionAskExplanation,
      explanation,
      setCurrentLogIndex,
    ],
  );

  return (
    <div className="border rounded-lg p-2" key={revisionItem.aspect_id}>
      <h4 className="font-medium">{revisionItem.aspect_title}</h4>
      <p className="text-sm">{revisionItem.comment}</p>
      {/* {revisionItem.suggestions.map((chunk, index) => (
        <React.Fragment key={index}>
          <p className="text-xs text-rose-500">{chunk.current_text}</p>
          <div className="flex items-start gap-1">
            <ArrowRight className="h-3 w-3 mt-[2px] shrink-0" />
            <p className="text-xs text-green-500">{chunk.replace_text}</p>
          </div>
        </React.Fragment>
      ))} */}
      <Divider className="!my-2" />
      {isExplanationLoading ? (
        <Loading />
      ) : explanationItem ? (
        <>
          <p className="text-xs mb-1">
            You have{' '}
            {explanationItem.response_type === 'agree'
              ? 'agreed with'
              : 'disagreed with'}{' '}
            the change!
          </p>{' '}
          {isRevisionAskExplanation ? (
            <>
              <p className="text-xs">Your explanation:</p>
              <p className="text-xs mb-2">{explanationItem.explanation}</p>
              <p className="text-xs">AI&apos;s explanation:</p>
              <p className="text-xs">{revisionItem.explanation}</p>
            </>
          ) : (
            <p className="text-xs">
              Explanation: {explanationItem.explanation}
            </p>
          )}
        </>
      ) : isRevisionAskExplanation ? (
        <>
          <div className="text-xs mb-2">
            Do you agree with this comment? Why do you think AI suggested this?
          </div>
          <div className="flex gap-2 mb-2">
            <Button
              className="flex-1"
              onClick={() => setAgreeing(true)}
              size="sm"
              variant={agreeing ? 'default' : 'outline'}
            >
              Agree
            </Button>
            <Button
              className="flex-1"
              onClick={() => setAgreeing(false)}
              size="sm"
              variant={agreeing ? 'outline' : 'default'}
            >
              Disagree
            </Button>
          </div>
          <TextInput
            onChange={e => setExplanation(e.target.value)}
            placeholder="e.g. Past tense, missing prepositions"
            size="xs"
            value={explanation}
          />
          <Button
            className="ml-auto mt-2"
            disabled={!explanation}
            loading={isSubmitting}
            onClick={() => handleSubmitExplanation(revisionItem)}
            size="sm"
          >
            {isLast || !isRevisionAskExplanation ? 'Submit' : 'Submit & Next'}
          </Button>
        </>
      ) : (
        <>
          <div className="text-xs mt-2">{revisionItem.explanation}</div>
          {/* {!readonly && (
            <Button
              className="w-full mt-2"
              loading={isSubmitting}
              onClick={() => handleAcceptRevision(revisionItem)}
            >
              Apply
            </Button>
          )} */}
        </>
      )}
    </div>
  );
};

export default EssayEditorRevisionToolRevisionItem;
