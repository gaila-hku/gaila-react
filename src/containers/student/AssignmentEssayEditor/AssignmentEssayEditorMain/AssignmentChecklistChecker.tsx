import React, { useCallback, useMemo } from 'react';

import clsx from 'clsx';
import { CheckCircle, Circle } from 'lucide-react';

import Clickable from 'components/input/Clickable';

import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { AssignmentRevisingContent } from 'types/assignment';

const AssignmentChecklistChecker = () => {
  const { assignment, currentStage, saveSubmission } =
    useAssignmentSubmissionProvider();

  const readonly = currentStage?.stage_type !== 'revising';

  const checklist = useMemo(() => {
    const readonlyChecklist =
      assignment?.checklist?.map(s => ({ text: s, completed: false })) || [];
    if (currentStage?.stage_type !== 'revising') {
      return readonlyChecklist;
    }
    return (
      (currentStage.submission?.content as AssignmentRevisingContent)
        .checklist_items || readonlyChecklist
    );
  }, [assignment?.checklist, currentStage]);

  const handleChecklistToggle = useCallback(
    (itemIndex: number) => {
      if (!assignment || currentStage?.stage_type !== 'revising') {
        return;
      }

      const newChecklist = [...checklist];
      newChecklist[itemIndex].completed = !newChecklist[itemIndex].completed;
      const currentContent = currentStage?.submission?.content as
        | AssignmentRevisingContent
        | undefined;
      const newContent = {
        ...(currentContent || { title: '', essay: '' }),
        checklist_items: newChecklist,
      };

      saveSubmission({
        assignment_id: assignment.id,
        stage_id: currentStage.id,
        content: newContent,
        is_final: currentStage.submission?.is_final || false,
        refetchProgress: true,
        changeStage: false,
      });
    },
    [assignment, checklist, currentStage, saveSubmission],
  );

  if (!checklist.length) {
    return <></>;
  }

  if (readonly) {
    return (
      <>
        {checklist.map((item, index) => (
          <div className="flex items-start gap-2 text-sm" key={index}>
            <Circle className="h-3 w-3 mt-1 flex-shrink-0" />
            <span className="text-muted-foreground">{item.text}</span>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {checklist.map((item, index) => (
        <div key={index}>
          <Clickable
            className={clsx(
              'flex items-center gap-2 p-2 rounded transition-colors',
              readonly ? '' : 'hover:bg-muted/50 ',
            )}
            disabled={readonly}
            key={`-${index}`}
            onClick={() => handleChecklistToggle(index)}
          >
            {readonly ? (
              <></>
            ) : item.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              >
                {item.text}
              </p>
            </div>
          </Clickable>
        </div>
      ))}
    </>
  );
};

export default AssignmentChecklistChecker;
