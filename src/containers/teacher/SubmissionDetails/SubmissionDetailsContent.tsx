import React, { type JSX, useCallback, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { AlertTriangle, Bot, CheckCircle, Circle } from 'lucide-react';

import Empty from 'components/display/Empty';
import Label from 'components/display/Label';
import SwitchInput from 'components/input/SwitchInput';
import Tabs from 'components/navigation/Tabs';

import GOAL_QUESTIONS from 'containers/student/AssignmentGoalEditor/goalQuestions';
import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';

import type {
  AssignmentEssayContent,
  AssignmentGoal,
  AssignmentReflectionContent,
  AssignmentStage,
  AssignmentSubmissionDetails,
  PlagiarisedSegment,
} from 'types/assignment';
import getStageTypeLabel from 'utils/helper/getStageTypeLabel';

type Props = {
  stages: AssignmentStage[];
  submissions: AssignmentSubmissionDetails['submissions'];
  plagiarisedSegments: PlagiarisedSegment[];
  plagiarisedPercentage: number | null;
};

const SubmissionDetailsContent = ({
  stages,
  submissions,
  plagiarisedSegments,
  plagiarisedPercentage,
}: Props) => {
  const [highlightChatGPT, setHighlightChatGPT] = useState(false);

  const highlightText = useCallback(
    (essay: string) => {
      if (!highlightChatGPT) return essay;

      let lastIndex = 0;
      const parts: JSX.Element[] = [];

      plagiarisedSegments.forEach((segment, idx) => {
        // Add non-highlighted text before this highlight
        if (lastIndex < segment.offset) {
          parts.push(
            <span key={`normal-${idx}`}>
              {essay.substring(lastIndex, segment.offset)}
            </span>,
          );
        }
        // Add highlighted text
        parts.push(
          <mark
            className="bg-yellow-200 dark:bg-yellow-900/50"
            key={`highlight-${idx}`}
          >
            {segment.sequence}
          </mark>,
        );
        lastIndex += segment.sequence.length;
      });

      // Add remaining text
      if (lastIndex < essay.length) {
        parts.push(<span key="normal-end">{essay.substring(lastIndex)}</span>);
      }

      return parts;
    },
    [highlightChatGPT, plagiarisedSegments],
  );

  const renderSubmissionContent = useCallback(
    (
      stage_type: AssignmentSubmissionDetails['stages'][number]['stage_type'],
      submission: (typeof submissions)[number],
    ) => {
      const header = (
        <span>
          Submitted: {dayjs(submission.submitted_at).format('MMM D, YYYY')}
        </span>
      );

      if (stage_type === 'goal_setting') {
        const goals = submission.content as AssignmentGoal[];
        return (
          <>
            <div className="text-sm text-muted-foreground pb-2">{header}</div>
            <div className="space-y-3">
              {GOAL_QUESTIONS.map(question => {
                const answer = goals.find(
                  goal => goal.category === question.category,
                );
                return (
                  <div key={question.category}>
                    <div className="p-3 bg-muted rounded-lg">
                      {question.question}
                    </div>
                    {answer ? (
                      answer.goals.map((goal, index) => (
                        <div
                          className="flex items-center gap-2 p-2"
                          key={`${question.category}-${index}`}
                        >
                          {goal.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p
                              className={`text-sm ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                            >
                              {goal.text}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        );
      }
      if (stage_type === 'writing') {
        const submissionContent = submission.content as AssignmentEssayContent;
        const essay = submissionContent.content;
        const wordCount = essay
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 0).length;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {header}
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <Label className="cursor-pointer" htmlFor="highlight-toggle">
                  Highlight ChatGPT copied text
                </Label>
              </div>
              <SwitchInput
                id="highlight-toggle"
                onChange={setHighlightChatGPT}
                value={highlightChatGPT}
              />
            </div>
            {highlightChatGPT && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Highlighted sections show potential ChatGPT-generated content
                  ({plagiarisedPercentage}% of essay)
                </span>
              </div>
            )}
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{highlightText(essay)}</p>
            </div>
          </div>
        );
      }
      if (stage_type === 'reflection') {
        const reflections = submission.content as AssignmentReflectionContent;
        return (
          <>
            <div className="text-sm text-muted-foreground pb-2">{header}</div>
            <div className="space-y-3">
              {REFLECTION_QUESTIONS.map(question => {
                const answer = reflections[question.id];
                return (
                  <div key={question.id}>
                    <div className="p-3 bg-muted rounded-lg">
                      {question.question}
                    </div>
                    {answer ? (
                      <div className="p-2">
                        <p className="text-sm">{answer}</p>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        );
      }
    },
    [highlightChatGPT, highlightText, plagiarisedPercentage],
  );

  const tabs = useMemo(() => {
    return stages
      .filter(stage => stage.enabled)
      .map(stage => {
        const submission = submissions.find(
          submission => submission.stage_id === stage.id,
        );

        return {
          key: stage.stage_type,
          title: getStageTypeLabel(stage),
          content: submission ? (
            renderSubmissionContent(stage.stage_type, submission)
          ) : (
            <Empty text="No submissions yet" />
          ),
        };
      });
  }, [renderSubmissionContent, stages, submissions]);

  return <Tabs tabs={tabs} />;
};

export default SubmissionDetailsContent;
