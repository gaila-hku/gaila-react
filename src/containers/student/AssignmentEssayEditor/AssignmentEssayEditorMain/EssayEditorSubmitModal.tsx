import React, { useCallback } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { X } from 'lucide-react';

import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';

import EssayEditorGoalChecker from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorGoalChecker';

import type {
  AssignmentEssayContent,
  AssignmentGoalContent,
} from 'types/assignment';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

  onChangeGoals: (goals: AssignmentGoalContent | null) => void;
  saveSubmissionContent: (
    newContent: Partial<AssignmentEssayContent>,
    isFinal: boolean,
  ) => void;
};

const EssayEditorSubmitModal = ({
  open,
  setOpen,
  onChangeGoals,
  saveSubmissionContent,
}: Props) => {
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    saveSubmissionContent({}, true);
  }, [setOpen, saveSubmissionContent]);

  return (
    <Modal onClose={handleClose} open={open}>
      <div
        className={clsx(
          'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
          'bg-white p-4 rounded-lg flex flex-col gap-4',
        )}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4>Confirm Submit</h4>
            <p className="text-sm text-muted-foreground">
              Before you submit, double check your goals
            </p>
          </div>
          <Clickable className="-m-1 p-1" onClick={handleClose}>
            <X />
          </Clickable>
        </div>
        <EssayEditorGoalChecker onChangeGoals={onChangeGoals} />
        <Button onClick={handleConfirm}>Submit</Button>
      </div>
    </Modal>
  );
};

export default EssayEditorSubmitModal;
