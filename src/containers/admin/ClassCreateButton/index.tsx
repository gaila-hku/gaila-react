import React, { useCallback, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { Plus, X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Label from 'components/display/Label';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import { apiCreateClass, apiGetAllClasses } from 'api/class';

const defaultClassValue = {
  name: '',
  description: '',
  teachers: [],
  students: [],
};

const ClassCreateButton = () => {
  const [open, setOpen] = useState(false);
  const [classValue, setClassValue] = useState(defaultClassValue);

  const queryClient = useQueryClient();
  const { mutate: createClass, isLoading } = useMutation(apiCreateClass, {
    onSuccess: () => {
      queryClient.invalidateQueries([apiGetAllClasses.queryKey]);
      setOpen(false);
    },
  });

  const handleClose = useCallback(() => {
    setOpen(false);
    setClassValue(defaultClassValue);
  }, []);

  const handleSubmit = useCallback(() => {
    createClass(classValue);
  }, [classValue, createClass]);

  return (
    <>
      <Button className="flex gap-2" onClick={() => setOpen(true)}>
        <Plus />
        Create Class
      </Button>
      <Modal onClose={handleClose} open={open}>
        <div
          className={clsx(
            'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
            'bg-white p-4 rounded-lg flex flex-col gap-4',
          )}
        >
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="text-lg leading-none font-semibold">
                Create Class
              </div>
              <div className="text-muted-foreground text-sm">
                Add a new class to the system
              </div>
            </div>
            <Clickable onClick={handleClose}>
              <X />
            </Clickable>
          </div>
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <TextInput
                id="name"
                onChange={e =>
                  setClassValue({ ...classValue, name: e.target.value })
                }
                placeholder="Class name"
                value={classValue.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <TextInput
                id="description"
                onChange={e =>
                  setClassValue({ ...classValue, description: e.target.value })
                }
                placeholder="Description"
                value={classValue.description}
              />
            </div>
          </div>
          <Button className="w-full" loading={isLoading} onClick={handleSubmit}>
            Create Class
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ClassCreateButton;
