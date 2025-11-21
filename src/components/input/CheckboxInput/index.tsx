import React, {
  type ComponentProps,
  useCallback,
  useMemo,
  useState,
} from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { styled } from '@mui/material/styles';
import { isNil } from 'lodash-es';

type Props = {
  value?: string[];
  onChange?: (value: string[]) => void;
  defaultValue?: string[];
  disabled?: boolean;
  options: {
    key: string;
    label: string;
    disabled?: boolean;
    required?: boolean;
    labelOnly?: boolean;
  }[];
  includeAll?: boolean;
  className?: string;
  labelSx?: ComponentProps<typeof FormControlLabel>['sx'];
};

const CheckboxInput = ({
  value: inputValue,
  onChange,
  defaultValue,
  disabled,
  options,
  includeAll,
  className,
  labelSx,
}: Props) => {
  const [value, setValue] = useState<string[]>(defaultValue || []);

  const finalValue = useMemo(() => {
    if (!isNil(inputValue)) {
      return inputValue;
    }
    if (!isNil(defaultValue)) {
      return defaultValue;
    }
    return value;
  }, [defaultValue, inputValue, value]);

  const onCheckAllChange = useCallback(
    (checked: boolean) => {
      const newValue = checked ? options.map(option => option.key) : [];
      if (inputValue) {
        onChange?.(newValue);
      } else {
        setValue(newValue);
      }
    },
    [inputValue, onChange, options],
  );

  const onCheckboxChange = useCallback(
    (key: string, checked: boolean) => {
      const oldValue = inputValue || value;
      const newValue = checked
        ? [...(oldValue || []), key]
        : oldValue?.filter(v => v !== key);

      if (inputValue) {
        onChange?.(newValue);
      } else {
        setValue(newValue);
      }
    },
    [inputValue, onChange, value],
  );

  return (
    <FormGroup className={className}>
      {includeAll && (
        <FormControlLabel
          control={
            <CustomCheckbox
              checked={finalValue.length === options.length}
              disabled={disabled}
              indeterminate={
                finalValue.length > 0 && finalValue.length < options.length
              }
              onChange={e => onCheckAllChange(e.target.checked)}
            />
          }
          label="Select All"
          sx={labelSx}
        />
      )}
      {options.map(option =>
        option.labelOnly ? (
          <div key={option.key}>{option.label}</div>
        ) : (
          <FormControlLabel
            control={
              <CustomCheckbox
                checked={finalValue.includes(option.key)}
                disabled={disabled || option.disabled}
                onChange={e => onCheckboxChange(option.key, e.target.checked)}
                required={option.required}
              />
            }
            disabled={option.disabled}
            key={option.key}
            label={option.label}
            sx={includeAll ? { ml: 2, ...labelSx } : labelSx}
          />
        ),
      )}
    </FormGroup>
  );
};

const CustomCheckbox = (props: ComponentProps<typeof Checkbox>) => (
  <Checkbox
    checkedIcon={<BpCheckedIcon />}
    color="default"
    disableRipple
    icon={<BpIcon />}
    indeterminateIcon={<BpIndeterminateIcon />}
    sx={{ '&:hover': { bgcolor: 'transparent' }, ...props.sx }}
    {...props}
  />
);

const BpIcon = styled('span')(({ theme }) => ({
  borderRadius: 3,
  width: 16,
  height: 16,
  boxShadow:
    'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: '#f5f8fa',
  backgroundImage:
    'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2,
  },
  'input:hover ~ &': {
    backgroundColor: '#ebf1f5',
    ...theme.applyStyles('dark', {
      backgroundColor: '#30404d',
    }),
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: 'rgba(206,217,224,.5)',
    ...theme.applyStyles('dark', {
      background: 'rgba(57,75,89,.5)',
    }),
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)',
    backgroundColor: '#394b59',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))',
  }),
}));

const BpIndeterminateIcon = styled(BpIcon)({
  backgroundColor: 'var(--primary)',
  backgroundImage:
    'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&::before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath " +
      "fill-rule='evenodd' clip-rule='evenodd' d='M4 7.5c0-.28.22-.5.5-.5h7c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5h-7a.5.5 0 01-.5-.5v-1z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: 'var(--primary-dim)',
  },
});

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: 'var(--primary)',
  backgroundImage:
    'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&::before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: 'var(--primary-dim)',
  },
});

export default CheckboxInput;
