import React, { useCallback, useMemo } from 'react';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';

import Button from 'components/input/Button';

import AssignmentEditorFormGoalStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormGoalStageInput';
import AssignmentEditorFormReflectionStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormReflectionStageInput';
import AssignmentEditorFormWritingStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormWritingStageInput';

import type { Assignment, AssignmentStageEditType } from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  stageIndex: number;
  onStageChange: (
    stageIndex: number,
    stage: AssignmentStageEditType | null,
  ) => void;
  formDataConfigValue: Assignment['config'];
  onFormDataChange: (field: string, value: any) => void;
};

const AssignmentEditorFormStageInputItem = ({
  stage,
  stageIndex,
  onStageChange,
  formDataConfigValue,
  onFormDataChange,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
  } = useDraggable({
    id: `stage-item-draggable-${stageIndex}`,
  });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `stage-item-droppable-${stageIndex}`,
  });
  const draggableStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const stageTitle = useMemo(() => {
    switch (stage.stage_type) {
      case 'goal_setting':
        return 'Goal Setting';
      case 'writing':
        return 'Writing';
      case 'reflection':
        return 'Reflection';
    }
  }, [stage.stage_type]);

  const stageInputElement = useMemo(() => {
    switch (stage.stage_type) {
      case 'goal_setting':
        return (
          <AssignmentEditorFormGoalStageInput
            onStageChange={stage => onStageChange(stageIndex, stage)}
            stage={stage}
          />
        );
      case 'writing':
        return (
          <AssignmentEditorFormWritingStageInput
            formDataConfigValue={formDataConfigValue}
            onFormDataChange={onFormDataChange}
            onStageChange={stage => onStageChange(stageIndex, stage)}
            stage={stage}
          />
        );
      case 'reflection':
        return (
          <AssignmentEditorFormReflectionStageInput
            formDataConfigValue={formDataConfigValue}
            onFormDataChange={onFormDataChange}
            onStageChange={stage => onStageChange(stageIndex, stage)}
            stage={stage}
          />
        );
    }
  }, [formDataConfigValue, onFormDataChange, onStageChange, stage, stageIndex]);

  const handleStageRemove = useCallback(() => {
    onStageChange(stageIndex, null);
  }, [onStageChange, stageIndex]);

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
            <h4>{stageTitle}</h4>
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
