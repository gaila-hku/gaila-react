import React, { type FormEvent, useCallback, useState } from 'react';

import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import ErrorMessage from 'components/display/ErrorMessage';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import { type ServerAuthToken, apiUserLogin } from 'api/auth';

import TokenLoginRedirect from './TokenLoginRedirect';

type Props = {
  redirect?: string;
  errorMessage?: string;
};

const LoginForm = ({ redirect, errorMessage }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<ServerAuthToken>();

  const [displayErrorMessage, setDisplayErrorMessage] = useState(errorMessage);

  const {
    mutate: loginRequest,
    isLoading,
    error,
  } = useMutation(apiUserLogin, {
    onSuccess: res => {
      setToken(res);
    },
  });

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!username || !password) {
        return;
      }
      setDisplayErrorMessage('');
      loginRequest({ username, password });
    },
    [loginRequest, password, username],
  );

  return (
    <form onSubmit={onSubmit}>
      <Card classes={{ children: 'flex flex-col gap-4 w-md' }} title="Login">
        <TextInput
          label="Username"
          onChange={e => setUsername(e.target.value)}
          size="medium"
          value={username}
        />
        <TextInput
          label="Password"
          onChange={e => setPassword(e.target.value)}
          size="medium"
          type="password"
          value={password}
        />
        {!isLoading && (!!displayErrorMessage || !!error) && (
          <ErrorMessage error={displayErrorMessage || error} />
        )}
        <Button
          disabled={!username || !password}
          loading={isLoading}
          type="submit"
        >
          Login
        </Button>
      </Card>
      {!!token && (
        <TokenLoginRedirect
          redirect={redirect ? decodeURIComponent(redirect) : undefined}
          response={token}
        />
      )}
    </form>
  );
};

export default LoginForm;
