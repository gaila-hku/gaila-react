import React from 'react';

import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';

type DeprecatedInputTypes = 'number' | 'search' | 'tel' | 'url';

type Props<T extends React.HTMLInputTypeAttribute> = Omit<
  React.ComponentProps<typeof TextField>,
  'size'
> & {
  size?: 'xs' | 'small' | 'medium';
  icon?: React.ReactNode;
  type?: T extends DeprecatedInputTypes ? never : T;
};

const TextInput = <T extends React.HTMLInputTypeAttribute>({
  className,
  label,
  multiline,
  size = multiline ? 'medium' : 'small',
  variant = 'filled',
  type,
  icon,
  sx,
  ...props
}: Props<T>) => {
  return (
    <TextField
      className={clsx(['w-full', className])}
      label={label}
      multiline={multiline}
      size={size === 'xs' ? 'medium' : size}
      slotProps={{
        input: {
          disableUnderline: true,
          ...(icon
            ? {
                startAdornment: (
                  <InputAdornment position="start">{icon}</InputAdornment>
                ),
              }
            : {}),
        },
      }}
      sx={{
        '& .MuiInputBase-root': {
          ...(label ? {} : { paddingTop: 1 }),
          ...sx?.['& .MuiInputBase-root'],
        },
        '& .MuiInputBase-input': {
          ...(label ? {} : { paddingTop: 0 }),
          ...(size === 'xs' ? { fontSize: 12, height: 12 } : {}),
          ...sx?.['& .MuiInputBase-input'],
        },
        ...sx,
      }}
      type={type}
      variant={variant}
      {...props}
    />
  );
};

export default TextInput;
