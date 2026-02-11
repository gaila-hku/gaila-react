import React, { useCallback } from 'react';

import dayjs from 'dayjs';
import { FileText } from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import TextInput from 'components/input/TextInput';

import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentWritingContent } from 'types/assignment';

type Props = {
  wordCountStatus: { color: string; text: string };
  saveSubmissionContent: (
    newContent: Partial<AssignmentWritingContent>,
    isFinal: boolean,
    alertMsg?: string,
  ) => void;
};

const EssayEditorHeader = ({
  wordCountStatus,
  saveSubmissionContent,
}: Props) => {
  const { assignment, outliningEnabled } = useAssignmentSubmissionProvider();
  const { outlineConfirmed, title, setTitle, readonly } =
    useAssignmentEssayEditorProvider();

  const onTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.relatedTarget?.tagName === 'BUTTON') {
        return;
      }
      saveSubmissionContent({}, false);
    },
    [saveSubmissionContent],
  );

  if (!assignment) {
    return;
  }

  return (
    <Card
      title={
        <>
          <div className="flex gap-4 mb-2">
            <FileText className="h-5 w-5" />
            {assignment.title}
          </div>
          <div className="font-normal text-base text-muted-foreground whitespace-pre-wrap">
            {assignment.description}
          </div>
        </>
      }
    >
      {!!assignment.requirements?.title && (
        <TextInput
          className="text-base sm:text-lg font-semibold !mb-4"
          disabled={readonly}
          label="Essay Title"
          onBlur={onTitleBlur}
          onChange={e => setTitle(e.target.value)}
          value={title}
        />
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {(!outliningEnabled || outlineConfirmed) && (
          <Badge
            className={`px-2 py-1 text-xs sm:text-sm ${wordCountStatus.color}`}
            variant="outline"
          >
            {wordCountStatus.text}
          </Badge>
        )}

        {!!assignment.due_date && (
          <Badge className="px-2 py-1 text-xs sm:text-sm" variant="outline">
            Due: {dayjs(assignment.due_date).format('MMM D, YYYY')}
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default EssayEditorHeader;
