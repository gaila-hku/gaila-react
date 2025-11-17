import * as React from 'react';

import { NumberField } from '@base-ui-components/react/number-field';
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';

import Label from 'components/display/Label';

import styles from './index.module.css';

type Props = {
  label?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  className?: string;
  inputClass?: string;
  size?: 'sm' | 'md';
  placeholder?: string;
} & React.ComponentProps<typeof NumberField.Root>;

function NumberInput({
  label,
  value,
  onChange,
  className,
  inputClass,
  size = 'md',
  placeholder,
  ...props
}: Props) {
  const id = React.useId();
  return (
    <NumberField.Root
      className={className}
      id={id}
      onValueChange={onChange}
      value={value}
      {...props}
    >
      {!!label && <Label htmlFor={id}>{label}</Label>}
      <NumberField.Group className={styles.group}>
        <NumberField.Decrement
          className={clsx(styles.decrement, size === 'sm' && styles.small)}
        >
          <Minus />
        </NumberField.Decrement>
        <NumberField.Input
          className={clsx(
            styles.input,
            inputClass,
            size === 'sm' && styles.small,
          )}
          placeholder={placeholder}
        />
        <NumberField.Increment
          className={clsx(styles.increment, size === 'sm' && styles.small)}
        >
          <Plus />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}

export default NumberInput;
