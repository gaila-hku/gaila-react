import React, { useCallback, useEffect, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Label from 'components/display/Label';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import SelectInput from 'components/input/SelectInput';
import TextInput from 'components/input/TextInput';

import useAlert from 'containers/common/AlertProvider/useAlert';

import { apiCreateUser, apiGetUserListing, apiUpdateUser } from 'api/user';
import { type User, type UserListingItem } from 'types/user';

type Props = {
  user: UserListingItem | null;
  setUser: React.Dispatch<React.SetStateAction<UserListingItem | null>>;
  isCreating: boolean;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultUserValue = {
  first_name: '',
  last_name: '',
  username: '',
  role: 'student' as const,
  password: '',
};

const UserListingEditModal = ({
  user,
  setUser,
  isCreating,
  setIsCreating,
}: Props) => {
  const { alertMsg } = useAlert();
  const queryClient = useQueryClient();

  const { mutate: updateUser, isLoading: isUpdateLoading } = useMutation(
    apiUpdateUser,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([apiGetUserListing.queryKey]);
        setUser(null);
        alertMsg('User updated');
      },
    },
  );

  const { mutate: createUser, isLoading: isCreateLoading } = useMutation(
    apiCreateUser,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([apiGetUserListing.queryKey]);
        setIsCreating(false);
        alertMsg('User created');
      },
    },
  );

  const [userValue, setUserValue] =
    useState<Omit<User, 'id'>>(defaultUserValue);

  useEffect(() => {
    if (user) {
      setUserValue({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username,
        role: user.role,
        password: '',
      });
    }
  }, [user]);

  const handleClose = useCallback(() => {
    setUserValue(defaultUserValue);
    setUser(null);
    setIsCreating(false);
  }, [setIsCreating, setUser]);

  const handleSubmit = useCallback(() => {
    if (isCreating) {
      createUser(userValue);
    } else {
      if (!user) {
        return;
      }
      updateUser({
        id: user.id,
        username: userValue.username,
        first_name: userValue.first_name,
        last_name: userValue.last_name,
        role: userValue.role,
        password: userValue.password,
      });
    }
  }, [createUser, isCreating, updateUser, user, userValue]);

  return (
    <Modal onClose={handleClose} open={!!user || isCreating}>
      <div
        className={clsx(
          'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
          'bg-white p-4 rounded-lg flex flex-col gap-4',
        )}
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="text-lg leading-none font-semibold">
              {isCreating ? 'Create New User' : 'Edit User'}
            </div>
            <div className="text-muted-foreground text-sm">
              {isCreating
                ? 'Add a new student or teacher account'
                : 'Edit a student or teacher account'}
            </div>
          </div>
          <Clickable onClick={handleClose}>
            <X />
          </Clickable>
        </div>
        <div className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <TextInput
              id="firstName"
              onChange={e =>
                setUserValue({ ...userValue, first_name: e.target.value })
              }
              placeholder="First name"
              value={userValue.first_name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <TextInput
              id="lastName"
              onChange={e =>
                setUserValue({ ...userValue, last_name: e.target.value })
              }
              placeholder="Last name"
              value={userValue.last_name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <TextInput
              id="username"
              onChange={e =>
                setUserValue({ ...userValue, username: e.target.value })
              }
              placeholder="Enter username"
              value={userValue.username}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <TextInput
              id="password"
              onChange={e =>
                setUserValue({ ...userValue, password: e.target.value })
              }
              placeholder="Enter password"
              type="password"
              value={userValue.password}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <SelectInput
              id="role"
              onChange={value => setUserValue({ ...userValue, role: value })}
              options={[
                { label: 'Student', value: 'student' },
                { label: 'Teacher', value: 'teacher' },
                { label: 'Admin', value: 'admin' },
              ]}
              value={userValue.role}
            />
          </div>
          <Button
            className="w-full"
            loading={isUpdateLoading || isCreateLoading}
            onClick={handleSubmit}
          >
            {isCreating ? 'Create User' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserListingEditModal;
