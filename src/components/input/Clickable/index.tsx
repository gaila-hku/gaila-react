/**
 *
 * Clickable
 *
 */
import React, { memo, useCallback } from 'react';

import cx from 'clsx';

interface Props {
  children?: React.ReactNode;
  label?: string;
  onClick?(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
  onMouseDown?(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
  onKeyDown?(e: React.KeyboardEvent<HTMLElement>): void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

function Clickable(
  {
    children,
    label,
    onClick,
    onMouseDown,
    onKeyDown,
    loading = false,
    disabled = false,
    className,
    style,
    title,
  }: Props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const onClickHandler = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (onClick && !loading && !disabled) {
        onClick(e);
      }
    },
    [onClick, loading, disabled],
  );

  const onKeyDownHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (onKeyDown && !loading && !disabled) {
        onKeyDown(e);
      }
    },
    [onKeyDown, loading, disabled],
  );

  return (
    <div
      className={cx([
        'relative appearance-none bg-transparent border-none p-0 shadow-none',
        disabled ? '' : 'hovercursor-pointer',
        className,
      ])}
      onClick={onClickHandler}
      onKeyDown={onKeyDownHandler}
      onMouseDown={onMouseDown}
      ref={ref}
      role="button"
      style={style}
      tabIndex={0}
      title={title}
    >
      {children}
      {label}
    </div>
  );
}

export default memo(React.forwardRef(Clickable));
