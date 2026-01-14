import React, { useCallback } from 'react';

import clsx from 'clsx';
import { AlertTriangle, NotebookPen } from 'lucide-react';

import Card from 'components/display/Card';

import type { AssignmentAnalytics } from 'types/assignment';

type Props = {
  plagiarisedSegments: AssignmentAnalytics['plagiarised_segments'];
  essay: string;
};

const DashboardPlagiarismDetector = ({ plagiarisedSegments, essay }: Props) => {
  const getCopyingPercentage = useCallback(() => {
    const essayLength = essay.length;

    if (essayLength === 0) {
      return 0;
    }
    const plagiarisedLength = plagiarisedSegments.reduce(
      (total, segment) => total + segment.sequence.length,
      0,
    );

    return (plagiarisedLength / essayLength) * 100;
  }, [essay, plagiarisedSegments]);

  const renderSegments = useCallback(() => {
    let lastIndex = 0;
    const segments = plagiarisedSegments.flatMap(segment => {
      const normalSegment = {
        content: essay.slice(lastIndex, segment.offset),
        type: 'normal',
      };
      lastIndex = segment.offset + segment.sequence.length;
      const plagiarisedSegment = {
        content: segment.sequence,
        type: segment.type,
      };
      return [normalSegment, plagiarisedSegment];
    });
    segments.push({
      content: essay.slice(lastIndex),
      type: 'normal',
    });
    return (
      <>
        {segments.map((segment, index) => (
          <span
            className={clsx(
              segment.type === 'pasted' && 'bg-yellow-300',
              segment.type === 'repeated' && 'bg-yellow-100',
            )}
            key={index}
          >
            {segment.content}
          </span>
        ))}
      </>
    );
  }, [essay, plagiarisedSegments]);

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2',
        description: '-mt-2 mb-2',
        root: 'h-fit',
      }}
      description="Check your writing for plagiarism"
      title={
        <>
          <NotebookPen />
          ChatGPT copying detector
        </>
      }
    >
      <div className="space-y-2 mb-2">
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            {getCopyingPercentage().toFixed(2)}% of essay flagged as potentially
            AI-generated
          </span>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-yellow-300 dark:bg-yellow-600/70 border border-yellow-400 dark:border-yellow-500 rounded"></div>
            <span>ChatGPT detected + paste logs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded"></div>
            <span>ChatGPT detected only</span>
          </div>
        </div>
      </div>
      <div className="whitespace-pre-wrap">{renderSegments()}</div>
    </Card>
  );
};

export default DashboardPlagiarismDetector;
