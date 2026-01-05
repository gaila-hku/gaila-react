import * as React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

type Props<T> = {
  label?: string;
  options: {
    label: string;
    value: T;
  }[];
  emptyOption?: boolean | string;
  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
  className?: string;
} & Omit<
  React.ComponentProps<typeof Select>,
  'defaultValue' | 'value' | 'onChange'
>;

export function SelectInput<T extends string | number | null>({
  label,
  options,
  emptyOption,
  value,
  onChange,
  className,
  size = 'small',
  ...props
}: Props<T>) {
  return (
    <FormControl className={className} sx={{ minWidth: 120 }}>
      {!!label && (
        <InputLabel htmlFor="grouped-native-select">{label}</InputLabel>
      )}
      <Select
        displayEmpty={!!emptyOption}
        label={label}
        onChange={e => onChange?.(e.target.value as T)}
        size={size}
        value={value}
        {...props}
      >
        {emptyOption && (
          <MenuItem aria-label="None" value="">
            <em className="text-muted-foreground">
              {typeof emptyOption === 'string' ? emptyOption : ''}
            </em>
          </MenuItem>
        )}
        {options.map(option => (
          <MenuItem key={option.value} value={option.value || ''}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SelectInput;
