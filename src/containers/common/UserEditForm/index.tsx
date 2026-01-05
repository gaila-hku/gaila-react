import React, { useCallback, useEffect, useState } from 'react';

import { useMutation, useQueryClient } from 'react-query';

import Label from 'components/display/Label';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import useAlert from 'containers/common/AlertProvider/useAlert';

import { apiGetUserProfile, apiUpdateUserProfile } from 'api/user';
import useProfile from 'utils/hooks/useProfile';
import getErrorMessage from 'utils/response/error';

const UserEditForm = () => {
  const { successMsg } = useAlert();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isLoading: isUpdating } = useMutation(
    apiUpdateUserProfile,
    {
      onSuccess: () => {
        successMsg('Profile updated');
        queryClient.invalidateQueries([apiGetUserProfile.queryKey]);
      },
      onError: e => {
        setError(getErrorMessage(e));
      },
    },
  );

  useEffect(() => {
    if (!profile) {
      return;
    }
    setFirstName(profile.first_name || '');
    setLastName(profile.last_name || '');
    setUsername(profile.username);
  }, [profile]);

  // TODO: support language change
  const handleSave = useCallback(() => {
    setError(null);
    updateProfile({
      first_name: firstName,
      last_name: lastName,
      username,
      ...(password ? { password } : {}),
    });
  }, [firstName, lastName, password, updateProfile, username]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <TextInput
          id="first_name"
          onChange={e => setFirstName(e.target.value)}
          placeholder="First Name"
          value={firstName}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <TextInput
          id="last_name"
          onChange={e => setLastName(e.target.value)}
          placeholder="Last Name"
          value={lastName}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username" required>
          Username
        </Label>
        <TextInput
          id="username"
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          value={username}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" required>
          Password
        </Label>
        <TextInput
          id="last_name"
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          value={password}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button className="w-full" loading={isUpdating} onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
};

export default UserEditForm;
