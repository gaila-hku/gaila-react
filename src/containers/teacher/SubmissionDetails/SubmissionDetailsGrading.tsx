import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { isNumber } from 'lodash-es';
import { Save, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Label from 'components/display/Label';
import Button from 'components/input/Button';
import NumberInput from 'components/input/NumberInput';
import TextInput from 'components/input/TextInput';

import useAlert from 'containers/common/AlertProvider/useAlert';

import {
  apiSaveAssignmentGrading,
  apiViewAssignmentSubmission,
} from 'api/assignment';
import { apiAskAutogradeAgent } from 'api/gpt';
import type {
  AssignmentDraftingContent,
  AssignmentRevisingContent,
  AssignmentSubmissionDetails,
  RubricItem,
} from 'types/assignment';
import type { AutoGradeResult } from 'types/gpt';

type Props = {
  submissions: AssignmentSubmissionDetails['submissions'];
  rubrics: RubricItem[];
  gradingToolId: number;
};

const SubmissionDetailsGrading = ({
  submissions,
  rubrics,
  gradingToolId,
}: Props) => {
  const queryClient = useQueryClient();
  const { successMsg } = useAlert();
  const { mutateAsync: askAutogradeAgent, isLoading: isGeneratingGrade } =
    useMutation(apiAskAutogradeAgent);
  const { mutateAsync: saveGrading, isLoading: isSavingGrading } = useMutation(
    apiSaveAssignmentGrading,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([apiViewAssignmentSubmission.queryKey]);
        successMsg('Grading saved successfully');
      },
    },
  );

  const [rubricScores, setRubricScores] = useState<
    Record<string, number | null>
  >(rubrics.reduce((acc, item) => ({ ...acc, [item.criteria]: null }), {}));
  const [grade, setGrade] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const [essaySubmissionId, essay, essaySubmissionGrade, isSubmissionFinal] =
    useMemo(() => {
      const revisingSubmission = submissions.find(
        submission => submission.stage_type === 'revising',
      );
      if (revisingSubmission) {
        return [
          revisingSubmission.id,
          (revisingSubmission.content as AssignmentRevisingContent).essay || '',
          revisingSubmission.grade,
          revisingSubmission.is_final,
        ];
      }
      const draftingSubmission = submissions.find(
        submission => submission.stage_type === 'drafting',
      );
      if (draftingSubmission) {
        return [
          draftingSubmission.id,
          (draftingSubmission.content as AssignmentDraftingContent).essay || '',
          draftingSubmission.grade,
          draftingSubmission.is_final,
        ];
      }
      return [null, '', null, false];
    }, [submissions]);

  useEffect(() => {
    if (!essaySubmissionGrade) {
      return;
    }
    setGrade(essaySubmissionGrade.overall_score);
    setRubricScores(essaySubmissionGrade.rubrics_breakdown);
    setFeedback(essaySubmissionGrade.overall_feedback || '');
  }, [essaySubmissionGrade]);

  const [locked, setLocked] = useState(false);
  useEffect(() => {
    if (essaySubmissionGrade) {
      return;
    }
    setLocked(isSubmissionFinal);
  }, [essaySubmissionGrade, isSubmissionFinal]);

  const maxScore = useMemo(() => {
    return rubrics.reduce((sum, item) => sum + (item.max_points || 0), 0);
  }, [rubrics]);

  const handleAIAutoGrade = useCallback(async () => {
    const res = await askAutogradeAgent({
      assignment_tool_id: gradingToolId,
      essay: essay,
      is_structured: true,
    });
    const result = JSON.parse(res.gpt_answer) as AutoGradeResult;

    const rubricScores = {};
    for (const rubric of rubrics) {
      if (rubric.max_points) {
        rubricScores[rubric.criteria] =
          result.criteria_scores.find(item => item.criteria === rubric.criteria)
            ?.score || 0;
      }
    }
    setRubricScores(rubricScores);
    setFeedback(
      `${result.criteria_scores.map(item => `${item.criteria}:\n${item.feedback}`).join('\n\n')}\n\nOverall:\n${result.overall_feedback}`,
    );
    if (maxScore) {
      setGrade(result.overall_score);
    }
    successMsg(
      'AI grading completed! Review and adjust the rubric scores and feedback as needed.',
    );
  }, [askAutogradeAgent, essay, gradingToolId, maxScore, rubrics, successMsg]);

  const handleRubricScoreChange = useCallback(
    (key: string, value: number | null) => {
      const newScores = { ...rubricScores, [key]: value };
      setRubricScores(newScores);

      const scores = Object.values(newScores).filter(score => score !== null);

      const total = scores.reduce((sum, score) => sum + score, 0);
      setGrade(total);
    },
    [rubricScores],
  );

  const handleSaveGrading = useCallback(() => {
    if (!essaySubmissionId || (maxScore > 0 && !isNumber(grade))) {
      return;
    }
    saveGrading({
      submission_id: essaySubmissionId,
      overall_score: grade || 0,
      rubrics_breakdown: rubricScores,
      overall_feedback: feedback,
    });
  }, [essaySubmissionId, feedback, grade, maxScore, rubricScores, saveGrading]);

  return (
    <Card classes={{ children: 'space-y-4' }} title="Grading">
      {locked && (
        <div className="border-purple-200 bg-purple-50 rounded-md py-2 px-3">
          <p className="text-sm text-purple-800">
            The student has not finalized their writing submission yet. Grading
            the essay now will prevent the student from editing it.
          </p>
          <Button
            className="mt-2 ml-auto"
            onClick={() => setLocked(false)}
            variant="secondary"
          >
            Grade Anyway
          </Button>
        </div>
      )}
      <Button
        className="w-full gap-2"
        disabled={isGeneratingGrade || locked}
        onClick={handleAIAutoGrade}
      >
        <Sparkles className="h-4 w-4" />
        {isGeneratingGrade ? 'Generating AI Grade...' : 'Auto-Grade with AI'}
      </Button>

      <Divider />

      {/* Rubric Breakdown */}
      <div className="space-y-2">
        <Label className="text-sm">Rubric Breakdown</Label>

        {rubrics.map(item => (
          <div
            className="flex items-center gap-2 p-2 border rounded bg-muted/30"
            key={item.criteria}
          >
            <Label
              className="text-xs flex-1"
              htmlFor={`rubric-${item.criteria}`}
            >
              {item.criteria}
            </Label>
            {item.max_points ? (
              <>
                <NumberInput
                  disabled={locked}
                  id={`rubric-${item.criteria}`}
                  inputClass="!w-16"
                  max={item.max_points}
                  min={0}
                  onChange={value =>
                    handleRubricScoreChange(item.criteria, value)
                  }
                  size="sm"
                  value={rubricScores[item.criteria]}
                />
                <span className="text-sm text-muted-foreground w-8">
                  / {item.max_points}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Not scored</span>
            )}
          </div>
        ))}
      </div>

      <Divider />

      {!!maxScore && (
        <div className="flex items-center gap-4">
          <Label className="flex-1" htmlFor="grade">
            Final Grade (%)
          </Label>
          <NumberInput
            disabled={locked}
            id="grade"
            max={100}
            min={0}
            onChange={setGrade}
            size="sm"
            value={grade}
          />
          <span className="text-sm text-muted-foreground w-8">
            / {maxScore}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <TextInput
          disabled={locked}
          id="feedback"
          multiline
          onChange={e => setFeedback(e.target.value)}
          placeholder="Provide feedback to the student..."
          rows={10}
          value={feedback}
        />
      </div>

      <Button
        className="w-full gap-2"
        disabled={(maxScore > 0 && !isNumber(grade)) || locked}
        loading={isSavingGrading}
        onClick={handleSaveGrading}
      >
        <Save className="h-4 w-4" />
        Save Grade & Feedback
      </Button>
    </Card>
  );
};

export default SubmissionDetailsGrading;
