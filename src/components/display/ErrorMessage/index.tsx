import React, { useMemo } from 'react';

import clsx from 'clsx';

import getErrorMessage from 'utils/response/error';

type Props = {
  error?: unknown;
  message?: string;
  className?: string;
};

const ErrorMessage = ({ error, message, className }: Props) => {
  const errorMessage = useMemo(() => {
    if (message) {
      return message;
    }
    return getErrorMessage(error);
  }, [error, message]);

  if (!error) {
    return <></>;
  }

  return <div className={clsx('text-red-400', className)}>{errorMessage}</div>;
};

export default ErrorMessage;
