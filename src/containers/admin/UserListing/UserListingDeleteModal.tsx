import React, { useCallback, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import useAlert from 'containers/common/AlertProvider/useAlert';

import { apiDeleteUser, apiGetUserListing } from 'api/user';
import type { UserListingItem } from 'types/user';
import getUserName from 'utils/helper/getUserName';

type Props = {
  deleteItem: UserListingItem | null;
  setDeleteItem: React.Dispatch<React.SetStateAction<UserListingItem | null>>;
};

const UserListingDeleteModal = ({ deleteItem, setDeleteItem }: Props) => {
  const { alertMsg, errorMsg } = useAlert();
  const queryClient = useQueryClient();

  const { mutate: deleteUser, isLoading } = useMutation(apiDeleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries([apiGetUserListing.queryKey]);
      setDeleteItem(null);
      alertMsg('User deleted');
    },
    onError: e => {
      errorMsg(e);
    },
  });

  const [input, setInput] = useState<string>('');

  const handleDeleteUser = useCallback(() => {
    if (!deleteItem || isLoading || input !== 'DELETE') {
      return;
    }
    deleteUser({ id: deleteItem.id });
  }, [deleteItem, deleteUser, input, isLoading]);

  return (
    <Modal onClose={() => setDeleteItem(null)} open={!!deleteItem}>
      <div
        className={clsx(
          'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
          'bg-white p-4 rounded-lg',
        )}
      >
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="text-lg leading-none font-semibold">
              Delete Account
            </div>
            <div className="text-muted-foreground text-sm">
              Are you sure you want to delete{' '}
              {deleteItem ? getUserName(deleteItem) : ''}?
            </div>
          </div>
          <Clickable onClick={() => setDeleteItem(null)}>
            <X />
          </Clickable>
        </div>
        <TextInput
          className="!mb-4"
          onChange={e => setInput(e.target.value)}
          placeholder="Type DELETE to confirm"
        />
        <div className="flex gap-4 w-full">
          <Button
            className="flex-1"
            onClick={() => setDeleteItem(null)}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={input !== 'DELETE'}
            loading={isLoading}
            onClick={handleDeleteUser}
            variant="destructive"
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserListingDeleteModal;
