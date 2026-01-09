import React from 'react';

import { isString } from 'lodash-es';
import queryString from 'query-string';
import { useLocation } from 'react-router';

import LoginForm from 'containers/auth/LoginForm';

import type { Route } from './+types/login';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'GAILA' },
    { name: 'GAILA system', content: 'Learning English with AI' },
  ];
}

export default function LoginPage() {
  const { search } = useLocation();
  const { r, e } = queryString.parse(search);
  const redirect = isString(r) ? r : undefined;
  const errorMessage = isString(e) ? e : undefined;

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <LoginForm errorMessage={errorMessage} redirect={redirect} />
    </div>
  );
}
