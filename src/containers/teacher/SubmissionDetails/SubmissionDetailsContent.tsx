import React, { type JSX, useCallback, useMemo, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { uniq } from 'lodash-es';
import { AlertTriangle, Bot, CheckCircle, Circle } from 'lucide-react';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Empty from 'components/display/Empty';
import Label from 'components/display/Label';
import SwitchInput from 'components/input/SwitchInput';
import Tabs from 'components/navigation/Tabs';

import GOAL_SECTIONS from 'containers/student/AssignmentGoalEditor/goalSections';
import { getAnnotationBackgroundColor } from 'containers/student/AssignmentReadingViewer/utils';
import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';

import type {
  AssignmentGoalContent,
  AssignmentReadingContent,
  AssignmentReflectionContent,
  AssignmentStage,
  AssignmentSubmissionDetails,
  PlagiarisedSegment,
} from 'types/assignment';
import getStageTypeLabel from 'utils/helper/getStageTypeLabel';

type Props = {
  stages: AssignmentStage[];
  submissions: AssignmentSubmissionDetails['submissions'];
  outline: string;
  essay: string;
  outlinePlagiarisedSegments: PlagiarisedSegment[];
  essayPlagiarisedSegments: PlagiarisedSegment[];
  plagiarisedPercentage: number | null;
};

const SubmissionDetailsContent = ({
  stages,
  submissions,
  outline,
  essay,
  outlinePlagiarisedSegments,
  essayPlagiarisedSegments,
  plagiarisedPercentage,
}: Props) => {
  const [highlightChatGPT, setHighlightChatGPT] = useState(false);

  const highlightText = useCallback(
    (text: string, plagiarisedSegments: PlagiarisedSegment[]) => {
      if (!highlightChatGPT) return text;

      let lastIndex = 0;
      const parts: JSX.Element[] = [];

      plagiarisedSegments.forEach((segment, idx) => {
        // Add non-highlighted text before this highlight
        if (lastIndex < segment.offset) {
          parts.push(
            <span key={`normal-${idx}`}>
              {text.substring(lastIndex, segment.offset)}
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
        lastIndex = segment.offset + segment.sequence.length;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(<span key="normal-end">{text.substring(lastIndex)}</span>);
      }

      return parts;
    },
    [highlightChatGPT],
  );

  const renderSubmissionContent = useCallback(
    (stage_type: string) => {
      if (stage_type === 'writing') {
        const outliningSubmission = submissions.find(
          submission => submission.stage_type === 'outlining',
        );
        const draftingSubmission = submissions.find(
          submission => submission.stage_type === 'drafting',
        );
        const revisingSubmission = submissions.find(
          submission => submission.stage_type === 'revising',
        );
        if (
          !outliningSubmission &&
          !draftingSubmission &&
          !revisingSubmission
        ) {
          return <Empty text="No submission found" />;
        }
        const lastSubmittedAt = Math.max(
          outliningSubmission?.submitted_at || 0,
          draftingSubmission?.submitted_at || 0,
          revisingSubmission?.submitted_at || 0,
        );
        const wordCount = essay
          ?.trim()
          .split(/\s+/)
          .filter(word => word.length > 0).length;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Submitted: {dayjs(lastSubmittedAt).format('MMM D, YYYY')}
              </span>
              <span>•</span>
              <span>{wordCount || 0} words</span>
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

            <Divider />
            <div className="flex font-medium text-md">Outline</div>
            <p className="whitespace-pre-wrap">
              {highlightText(outline, outlinePlagiarisedSegments) || '-'}
            </p>
            <Divider />
            <div className="flex font-medium text-md">Essay</div>
            <p className="whitespace-pre-wrap">
              {highlightText(essay, essayPlagiarisedSegments) || '-'}
            </p>
          </div>
        );
      }

      const submission = submissions.find(s => s.stage_type === stage_type);
      if (!submission) {
        return <Empty text="No submission found" />;
      }

      if (stage_type === 'reading') {
        const content = submission.content as AssignmentReadingContent;
        const annotations = content.annotations;
        if (!annotations.length) return <Empty text="No annotations made" />;
        return (
          <>
            <div className="text-sm text-muted-foreground pb-2">
              Last modified:{' '}
              {dayjs(submission.submitted_at).format('MMM D, YYYY')}
            </div>
            <div className="space-y-3">
              {annotations.map(annotation => (
                <Card
                  className="border-l-4 !p-4"
                  key={annotation.id}
                  style={{
                    borderLeftColor: getAnnotationBackgroundColor(
                      annotation.color,
                    ),
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium italic text-muted-foreground line-clamp-2">
                        &quot;{annotation.text}&quot;
                      </p>
                      {(annotation.label || annotation.note) && (
                        <Divider className="!my-2" />
                      )}
                      {annotation.label && (
                        <p className="text-sm">{annotation.label}</p>
                      )}
                      {annotation.note && (
                        <p className="text-sm">{annotation.note}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        );
      }

      if (stage_type === 'goal_setting') {
        const content = submission.content as AssignmentGoalContent;
        return (
          <>
            <div className="text-sm text-muted-foreground pb-2">
              Submitted: {dayjs(submission.submitted_at).format('MMM D, YYYY')}
            </div>
            <div className="space-y-3">
              {GOAL_SECTIONS.map(section => {
                const goals = content[section.categoryKey];
                return (
                  <div key={section.categoryKey}>
                    <div className="p-3 bg-muted rounded-lg">
                      {section.question}
                    </div>
                    {goals.map((goal, goalIndex) => (
                      <div key={`${section.categoryKey}-${goalIndex}`}>
                        <div className="flex gap-2 items-center ml-2 mt-2">
                          <div className="bg-black w-1 h-1 rounded-full" />
                          <p className="text-sm">{goal.goalText}</p>
                        </div>
                        {goal.strategies.map((strategy, strategyIndex) => (
                          <div
                            className="flex items-center gap-2 p-2"
                            key={`${section.categoryKey}-${goalIndex}-${strategyIndex}`}
                          >
                            {strategy.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            )}
                            <p
                              className={clsx(
                                'text-sm',
                                strategy.completed
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground',
                              )}
                            >
                              {strategy.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        );
      }
      if (stage_type === 'reflection') {
        const reflections = submission.content as AssignmentReflectionContent;
        return (
          <>
            <div className="text-sm text-muted-foreground pb-2">
              Submitted: {dayjs(submission.submitted_at).format('MMM D, YYYY')}
            </div>
            <div className="space-y-3">
              {REFLECTION_QUESTIONS.map((question, index) => {
                const answer = reflections[index];
                return (
                  <div key={index}>
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
    [
      essay,
      essayPlagiarisedSegments,
      highlightChatGPT,
      highlightText,
      outline,
      outlinePlagiarisedSegments,
      plagiarisedPercentage,
      submissions,
    ],
  );

  const tabs = useMemo(() => {
    const tabKeys: string[] = [];
    for (const stage of stages) {
      if (stage.stage_type === 'language_preparation') {
        continue;
      }
      if (
        (stage.stage_type === 'outlining' ||
          stage.stage_type === 'drafting' ||
          stage.stage_type === 'revising') &&
        stage.enabled
      ) {
        tabKeys.push('writing');
      } else if (stage.enabled) {
        tabKeys.push(stage.stage_type);
      }
    }
    return uniq(tabKeys).map(tabKey => ({
      key: tabKey,
      title: getStageTypeLabel({ stage_type: tabKey }, true),
      content: renderSubmissionContent(tabKey),
    }));
  }, [renderSubmissionContent, stages]);

  return <Tabs tabs={tabs} />;
};

export default SubmissionDetailsContent;
