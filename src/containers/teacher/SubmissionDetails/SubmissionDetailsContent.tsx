import React, { type JSX, useCallback, useMemo, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { uniq } from 'lodash-es';
import { AlertTriangle, Bot, CheckCircle, Circle } from 'lucide-react';

import Divider from 'components/display/Divider';
import Empty from 'components/display/Empty';
import Label from 'components/display/Label';
import SwitchInput from 'components/input/SwitchInput';
import Tabs from 'components/navigation/Tabs';

import GOAL_SECTIONS from 'containers/student/AssignmentGoalEditor/goalSections';
import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';

import type {
  AssignmentDraftingContent,
  AssignmentGoalContent,
  AssignmentOutliningContent,
  AssignmentReflectionContent,
  AssignmentRevisingContent,
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
    (stage_type: string) => {
      if (stage_type === 'writing') {
        let outline = '';
        let essay = '';
        let lastSubmittedAt = 0;
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
        if (outliningSubmission) {
          const outlineContent =
            outliningSubmission.content as AssignmentOutliningContent;
          outline = outlineContent.outline;
          lastSubmittedAt = outliningSubmission.submitted_at;
        }
        if (draftingSubmission) {
          const draftingContent =
            draftingSubmission.content as AssignmentDraftingContent;
          essay = draftingContent.essay;
          lastSubmittedAt = draftingSubmission.submitted_at;
        }
        if (revisingSubmission) {
          const revisingContent =
            revisingSubmission.content as AssignmentRevisingContent;
          essay = revisingContent.essay;
          lastSubmittedAt = revisingSubmission.submitted_at;
        }
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

            <Divider />
            <div className="flex font-medium text-md">Outline</div>
            <p className="whitespace-pre-wrap">{outline}</p>
            <Divider />
            <div className="flex font-medium text-md">Essay</div>
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
              <p className="whitespace-pre-wrap">
                {highlightText(essay) || '-'}
              </p>
            </div>
          </div>
        );
      }

      const submission = submissions.find(s => s.stage_type === stage_type);
      if (!submission) {
        return <Empty text="No submission found" />;
      }

      const header = (
        <span>
          Submitted: {dayjs(submission.submitted_at).format('MMM D, YYYY')}
        </span>
      );

      if (stage_type === 'goal_setting') {
        const content = submission.content as AssignmentGoalContent;
        return (
          <>
            <div className="text-sm text-muted-foreground pb-2">{header}</div>
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
            <div className="text-sm text-muted-foreground pb-2">{header}</div>
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
    [highlightChatGPT, highlightText, plagiarisedPercentage, submissions],
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
      }
      if (stage.enabled) {
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
