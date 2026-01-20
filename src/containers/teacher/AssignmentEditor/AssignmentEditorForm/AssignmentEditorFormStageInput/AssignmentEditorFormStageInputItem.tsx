import React, { useCallback, useMemo } from 'react';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';

import Button from 'components/input/Button';

import AssignmentEditorFormDraftingStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormDraftingStageInput';
import AssignmentEditorFormGoalStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormGoalStageInput';
import AssignmentEditorFormLanguageStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormLanguageStageInput';
import AssignmentEditorFormOutlineStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormOutlineStageInput';
import AssignmentEditorFormReadingStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormReadingStageInput';
import AssignmentEditorFormReflectionStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormReflectionStageInput';
import AssignmentEditorFormRevisingStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormRevisingStageInput';

import type { AssignmentStageEditType } from 'types/assignment';
import getStageTypeLabel from 'utils/helper/getStageTypeLabel';

type Props = {
  stage: AssignmentStageEditType;
  index: number;
  onStageChange: (stage: AssignmentStageEditType | null) => void;
};

const AssignmentEditorFormStageInputItem = ({
  stage,
  index,
  onStageChange,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
  } = useDraggable({
    id: `stage-item-draggable-${index}`,
  });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `stage-item-droppable-${index}`,
  });
  const draggableStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const stageInputElement = useMemo(() => {
    const props = { onStageChange, stage };
    switch (stage.stage_type) {
      case 'reading':
        return <AssignmentEditorFormReadingStageInput {...props} />;
      case 'language_preparation':
        return <AssignmentEditorFormLanguageStageInput {...props} />;
      case 'goal_setting':
        return <AssignmentEditorFormGoalStageInput {...props} />;
      case 'outlining':
        return <AssignmentEditorFormOutlineStageInput {...props} />;
      case 'drafting':
        return <AssignmentEditorFormDraftingStageInput {...props} />;
      case 'revising':
        return <AssignmentEditorFormRevisingStageInput {...props} />;
      case 'reflection':
        return <AssignmentEditorFormReflectionStageInput {...props} />;
    }
  }, [onStageChange, stage]);

  const handleStageRemove = useCallback(() => {
    onStageChange(null);
  }, [onStageChange]);

  return (
    <>
      <div
        className="p-4 pl-0 border rounded-lg bg-muted/30 flex items-stretch"
        style={draggableStyle}
      >
        <div
          className="flex items-center justify-center p-2 cursor-grab"
          ref={setDraggableNodeRef}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4>{getStageTypeLabel(stage)}</h4>
            <Button onClick={handleStageRemove} size="sm" variant="secondary">
              Remove
            </Button>
          </div>
          {stageInputElement}
        </div>
      </div>
      <div
        className={clsx(isOver && 'bg-green-400', 'h-3')}
        ref={setDroppableNodeRef}
      />
    </>
  );
};

export default AssignmentEditorFormStageInputItem;
