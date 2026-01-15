import React, { useCallback, useEffect, useState } from 'react';

import { type DragEndEvent, DndContext } from '@dnd-kit/core';
import { isEmpty } from 'lodash-es';
import { Check } from 'lucide-react';

import Popover from 'components/display/Popover';
import Command, { CommandItem } from 'components/display/Popover/Command';

import AssignmentEditorFormStageInputItem from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/AssignmentEditorFormStageInputItem';

import type { Assignment, AssignmentStageEditType } from 'types/assignment';

type Props = {
  formDataStageValue: AssignmentStageEditType[];
  formDataConfigValue: Assignment['config'];
  onFormDataChange: (field: string, value: any) => void;
  isEditing: boolean;
};

const availableStages = [
  { key: 'goal_setting', label: 'Goal Setting' },
  { key: 'writing', label: 'Writing' },
  { key: 'reflection', label: 'Reflection' },
];

const defaultStages: AssignmentStageEditType[] = [
  {
    stage_type: 'goal_setting',
    enabled: true,
    tools: [{ key: 'goal_general', enabled: true }],
  },
  {
    stage_type: 'writing',
    enabled: true,
    tools: [
      { key: 'ideation_guiding', enabled: true },
      { key: 'outline_review', enabled: true },
      { key: 'dictionary', enabled: true },
      { key: 'autograde', enabled: true },
      { key: 'revision', enabled: true },
      { key: 'writing_general', enabled: true },
    ],
  },
  {
    stage_type: 'reflection',
    enabled: true,
    tools: [{ key: 'reflection_general', enabled: true }],
  },
];

const AssignmentEditorFormStageInput = ({
  formDataStageValue,
  formDataConfigValue,
  onFormDataChange,
  isEditing,
}: Props) => {
  const [stages, setStages] =
    useState<AssignmentStageEditType[]>(defaultStages);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (isEmpty(formDataStageValue)) {
      setStages(defaultStages);
      if (!isEditing) {
        onFormDataChange('stages', defaultStages);
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
    (stageType: string) => {
      const newStages = [...stages];
      const existingStage = newStages.find(s => s.stage_type === stageType);
      if (existingStage) {
        existingStage.enabled = true;
      } else {
        newStages.push({
          stage_type: stageType,
          enabled: true,
          tools: [],
        });
      }
      setStages(newStages);
      onFormDataChange('stages', newStages);
      setPopoverOpen(false);
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
      const [removed] = newStages.splice(activeId, 1);
      newStages.splice(overId, 0, removed);
      console.log(newStages);
      setStages(newStages);
      onFormDataChange('stages', newStages);
    },
    [onFormDataChange, stages],
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
        <Popover
          buttonText="Add Stage"
          childClass="!p-2"
          onClickButton={() => setPopoverOpen(true)}
          onClosePopover={() => setPopoverOpen(false)}
          open={popoverOpen}
        >
          <Command>
            {availableStages?.map(stage => {
              const isStageAdded = stages.some(
                s => s.stage_type === stage.key && s.enabled,
              );
              return (
                <CommandItem
                  disabled={isStageAdded}
                  key={stage.key}
                  onSelect={() => handleAddStage(stage.key)}
                  value={stage.key}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {isStageAdded && <Check className="h-4 w-4" />}
                      <p className="text-sm">{stage.label}</p>
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </Command>
        </Popover>
      </div>
      {/* <div>
        <DndContext onDragEnd={handleDragEnd}>
          {stages.map((stage, index) =>
            stage.enabled ? (
              <AssignmentEditorFormStageInputItem
                formDataConfigValue={formDataConfigValue}
                key={index}
                onFormDataChange={onFormDataChange}
                onStageChange={handleStageChange}
                stage={stage}
                stageIndex={index}
              />
            ) : null,
          )}
        </DndContext>  */}
      <div>
        {stages.map((stage, index) =>
          stage.enabled ? (
            <AssignmentEditorFormStageInputItem
              formDataConfigValue={formDataConfigValue}
              key={index}
              onFormDataChange={onFormDataChange}
              onStageChange={handleStageChange}
              stage={stage}
              stageIndex={index}
            />
          ) : null,
        )}
      </div>
    </div>
  );
};

export default AssignmentEditorFormStageInput;
