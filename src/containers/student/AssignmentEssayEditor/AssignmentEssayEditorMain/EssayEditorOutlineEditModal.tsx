import React, { useCallback, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { X } from 'lucide-react';

import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';

import EssayEditorInput from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorInput';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import type { AssignmentEssayContent } from 'types/assignment';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saveSubmissionContent: (
    newContent: Partial<AssignmentEssayContent>,
    isFinal: boolean,
  ) => void;
};

const EssayEditorOutlineEditModal = ({
  open,
  setOpen,
  saveSubmissionContent,
}: Props) => {
  const { outline, setOutline } = useAssignmentEssayEditorProvider();

  const [outlineInputValue, setOutlineInputValue] = useState(outline);

  const handleClose = useCallback(() => {
    setOpen(false);
    setOutlineInputValue(outline);
  }, [outline, setOpen]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    setOutline(outlineInputValue);
    saveSubmissionContent({ outline: outlineInputValue }, false);
  }, [setOpen, setOutline, outlineInputValue, saveSubmissionContent]);

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
            <h4>Edit Outline</h4>
            <p className="text-sm text-muted-foreground">
              Make quick changes to your outline
            </p>
          </div>
          <Clickable className="-m-1 p-1" onClick={handleClose}>
            <X />
          </Clickable>
        </div>
        <EssayEditorInput
          disableAutoSave
          onChange={setOutlineInputValue}
          value={outlineInputValue}
        />
        <Button onClick={handleConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
};

export default EssayEditorOutlineEditModal;
