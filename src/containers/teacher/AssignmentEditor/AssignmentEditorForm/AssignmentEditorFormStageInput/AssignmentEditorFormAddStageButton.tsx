import React, { useCallback, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import {
  Book,
  FileCheck,
  Languages,
  Pencil,
  Plus,
  RefreshCcwDot,
  TableOfContents,
  Target,
} from 'lucide-react';

import Divider from 'components/display/Divider';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';

import type {
  AssignmentStage,
  AssignmentStageEditType,
} from 'types/assignment';

const availableStages = [
  {
    key: 'reading' as const,
    label: 'Reading',
    icon: <Book size={52} />,
    description: 'Add reading material to the assignment',
  },
  {
    key: 'language_preparation' as const,
    label: 'Lagnuage Preparation',
    icon: <Languages size={52} />,
    description: 'Show students example essays, vocabularies and phrases',
  },
  {
    key: 'goal_setting' as const,
    label: 'Goal Setting',
    icon: <Target size={52} />,
    description: 'Prompt students to set goals and strategies before writing',
  },
  {
    key: 'outlining' as const,
    label: 'Outlining',
    icon: <TableOfContents size={52} />,
    description:
      '1/3 writing stage - Prompts students to outline their essay with assisting and reviewing tools before drafting.',
  },
  {
    key: 'drafting' as const,
    label: 'Drafting',
    icon: <Pencil size={52} />,
    description: '2/3 writing stage - The main writing stage.',
  },
  {
    key: 'revising' as const,
    label: 'Revising',
    icon: <FileCheck size={52} />,
    description:
      '3/3 writing stages - Prompts students to review their draft with automated feedback tools.',
  },
  {
    key: 'reflection' as const,
    label: 'Reflection',
    icon: <RefreshCcwDot size={52} />,
    description:
      'Prompt students to reflect on their writing progress and AI interactions',
  },
];

type Props = {
  stages: AssignmentStageEditType[];
  onAddStage: (stage: AssignmentStage['stage_type']) => void;
};

const AssignmentEditorFormAddStageButton = ({ stages, onAddStage }: Props) => {
  const [open, setOpen] = useState(false);

  const [activeStage, setActiveStage] = useState<
    AssignmentStage['stage_type'] | null
  >(null);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleStageClick = useCallback(
    (stage: AssignmentStage['stage_type']) => {
      setActiveStage(stage);
    },
    [],
  );

  const handleAddStage = useCallback(() => {
    if (activeStage) {
      onAddStage(activeStage);
      handleClose();
    }
  }, [activeStage, handleClose, onAddStage]);

  const remainingStages = availableStages.filter(
    stage => !stages.some(s => s.stage_type === stage.key && s.enabled),
  );

  return (
    <>
      <Button
        className="flex gap-2"
        disabled={!remainingStages.length}
        onClick={() => setOpen(true)}
      >
        <Plus />
        Add Stage
      </Button>
      <Modal onClose={handleClose} open={open}>
        <div
          className={clsx(
            'absolute top-1/2 left-1/2 -translate-1/2 w-[800px]',
            'bg-white p-4 rounded-lg',
          )}
        >
          <h3>Add Stage</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Select a stage to add
          </p>
          <div className="grid grid-cols-5 gap-2 items-center justify-center bg-gray-100 rounded-xl p-4 mb-2">
            {remainingStages.map(stage => (
              <Clickable
                className={clsx(
                  'w-32 h-32 rounded-xl p-4 flex flex-col',
                  activeStage === stage.key ? '!bg-gray-300' : '!bg-white',
                )}
                key={stage.key}
                onClick={() => handleStageClick(stage.key)}
              >
                <div className="flex-1 flex items-center justify-center">
                  {stage.icon}
                </div>
                <Divider className="!border-gray-400 !my-1" />
                <p className={clsx('text-sm text-center w-full')}>
                  {stage.label}
                </p>
              </Clickable>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {availableStages.find(s => s.key === activeStage)?.description}
          </p>
          <Button
            className="ml-auto"
            disabled={!activeStage}
            onClick={handleAddStage}
          >
            Add Stage
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AssignmentEditorFormAddStageButton;
