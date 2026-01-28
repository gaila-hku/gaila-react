import React, { useCallback, useMemo } from 'react';

import clsx from 'clsx';
import { TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Button from 'components/input/Button';

import getErrorMessage from 'utils/response/error';

type Props = {
  error?: unknown;
  message?: string;
  className?: string;
  backToHome?: boolean;
};

const ErrorComponent = ({
  error,
  message,
  className,
  backToHome = true,
}: Props) => {
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    navigate(pathnames.home());
  }, [navigate]);

  const errorMessage = useMemo(() => {
    if (message) {
      return message;
    }
    return getErrorMessage(error);
  }, [error, message]);

  return (
    <div
      className={clsx([
        'flex flex-col items-center max-w-md mx-auto gap-4',
        className,
      ])}
    >
      <TriangleAlert className="h-12 w-12" />
      <div className="text-center">
        An error has occured. If you unintentionally triggered this, please
        contact admin with the following error message:{' '}
        <span className="text-red-400">{errorMessage}</span>
      </div>
      {!!backToHome && <Button onClick={onClick}>Back to Home</Button>}
    </div>
  );
};

export default ErrorComponent;
