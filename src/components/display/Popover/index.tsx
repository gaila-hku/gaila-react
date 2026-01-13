import React, {
  type ComponentProps,
  useCallback,
  useEffect,
  useState,
} from 'react';

import MuiPopover from '@mui/material/Popover';
import clsx from 'clsx';
import { isBoolean } from 'lodash-es';

import Button from 'components/input/Button';

type Props = {
  buttonText: React.ReactNode;
  buttonVariant?: ComponentProps<typeof Button>['variant'];
  onClickButton?: () => void;
  onClosePopover?: () => void;
  open?: boolean;
  childClass?: string;
  buttonClass?: string;
  className?: string;
  children: React.ReactNode;
};

const Popover = ({
  buttonText,
  buttonVariant = 'secondary',
  onClickButton,
  onClosePopover,
  open: inputOpen,
  childClass,
  buttonClass,
  className,
  children,
}: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isBoolean(inputOpen)) {
      setOpen(inputOpen && Boolean(anchorEl));
      return;
    }
    setOpen(Boolean(anchorEl));
  }, [anchorEl, inputOpen]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false);
      setAnchorEl(event.currentTarget);
      onClickButton?.();
    },
    [onClickButton],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setAnchorEl(null);
    onClosePopover?.();
  }, [onClosePopover]);

  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Button
        aria-describedby={id}
        className={buttonClass}
        onClick={handleClick}
        variant={buttonVariant}
      >
        {buttonText}
      </Button>
      <MuiPopover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        className={className}
        id={id}
        onClose={handleClose}
        open={open}
      >
        <div
          className={clsx(
            'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
            childClass,
          )}
        >
          {children}
        </div>
      </MuiPopover>
    </>
  );
};

export default Popover;
