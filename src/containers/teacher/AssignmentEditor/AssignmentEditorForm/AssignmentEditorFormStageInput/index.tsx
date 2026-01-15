import React, { useCallback, useEffect, useState } from 'react';

import { type DragEndEvent, DndContext } from '@dnd-kit/core';
import { isEmpty } from 'lodash-es';

import useAlert from 'containers/common/AlertProvider/useAlert';
import AssignmentEditorFormAddStageButton from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormAddStageButton';
import AssignmentEditorFormStageInputItem from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormStageInputItem';
import {
  DEFAULT_STAGES,
  validateStageOrder,
} from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/utils';

import type {
  AssignmentStage,
  AssignmentStageEditType,
} from 'types/assignment';

type Props = {
  formDataStageValue: AssignmentStageEditType[];
  onFormDataChange: (field: string, value: any) => void;
  isEditing: boolean;
};

const AssignmentEditorFormStageInput = ({
  formDataStageValue,
  onFormDataChange,
  isEditing,
}: Props) => {
  const { errorMsg } = useAlert();
  const [stages, setStages] =
    useState<AssignmentStageEditType[]>(DEFAULT_STAGES);

  useEffect(() => {
    if (isEmpty(formDataStageValue)) {
      setStages(DEFAULT_STAGES);
      if (!isEditing) {
        onFormDataChange('stages', DEFAULT_STAGES);
      }
    } else {
      setStages(formDataStageValue);
    }
  }, [formDataStageValue, isEditing, onFormDataChange]);

  const handleStageChange = useCallback(
    (stageIndex: number, stage: AssignmentStageEditType | null) => {
      const newStages = [...stages];
      if (stage === null) {
        newStages[stageIndex].enabled = false;
      } else {
        newStages[stageIndex] = stage;
      }
      setStages(newStages);
      onFormDataChange('stages', newStages);
    },
    [onFormDataChange, stages],
  );

  const handleAddStage = useCallback(
    (stageType: AssignmentStage['stage_type']) => {
      const newStages = [...stages];
      const existingStage = newStages.find(s => s.stage_type === stageType);
      if (existingStage) {
        existingStage.enabled = true;
      } else {
        newStages.push({
          stage_type: stageType,
          enabled: true,
          tools: [],
          config: {},
        });
      }
      setStages(newStages);
      onFormDataChange('stages', newStages);
    },
    [onFormDataChange, stages],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;
      if (!over || !active) {
        return;
      }

      const overId = Number((over.id as string).split('-')[3]);
      const activeId = Number((active.id as string).split('-')[3]);
      if (isNaN(overId) || isNaN(activeId) || overId === activeId) {
        return;
      }

      const newStages = [...stages];
      if (activeId < overId) {
        newStages.splice(overId, 0, newStages.splice(activeId, 1)[0]);
      } else {
        newStages.splice(overId + 1, 0, newStages.splice(activeId, 1)[0]);
      }

      const orderErrorMsg = validateStageOrder(newStages);
      if (orderErrorMsg) {
        errorMsg(orderErrorMsg);
        return;
      }
      setStages(newStages);
      onFormDataChange('stages', newStages);
    },
    [errorMsg, onFormDataChange, stages],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="font-medium">Stages and Tools</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Choose to include writing stages and enable tools for students
          </p>
        </div>
        <AssignmentEditorFormAddStageButton
          onAddStage={handleAddStage}
          stages={stages}
        />
      </div>
      <div>
        <DndContext onDragEnd={handleDragEnd}>
          {stages.map((stage, index) =>
            stage.enabled ? (
              <AssignmentEditorFormStageInputItem
                index={index}
                key={index}
                onStageChange={stage => handleStageChange(index, stage)}
                stage={stage}
              />
            ) : null,
          )}
        </DndContext>
      </div>
    </div>
  );
};

export default AssignmentEditorFormStageInput;
