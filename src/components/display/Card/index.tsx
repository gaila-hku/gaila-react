import React, { memo, useMemo, useState } from 'react';

import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';

import Clickable from 'components/input/Clickable';

import Badge, { badgeClasses } from '../Badge';

type Props = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  badgeText?: React.ReactNode;
  badgeVariant?: keyof typeof badgeClasses;
  status?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  classes?: {
    root?: string;
    header?: string;
    title?: string;
    description?: string;
    badge?: string;
    status?: string;
    children?: string;
    footer?: string;
  };
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  footer?: React.ReactNode;
};

function Card({
  title,
  description,
  badgeText,
  badgeVariant = 'secondary',
  status,
  action,
  children,
  footer,
  collapsible,
  defaultCollapsed = false,
  classes,
  className,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const hasHeader =
    !!title || !!badgeText || !!status || !!description || !!action;

  const childrenAndFooter = useMemo(
    () => (
      <>
        <div
          className={clsx(['[&:not(:last-child)]:pb-6', classes?.children])}
          data-slot="card-content"
        >
          {children}
        </div>

        {!!footer && (
          <div
            className={clsx(
              classes?.footer,
              'flex items-center [.border-t]:pt-6',
            )}
            data-slot="card-footer"
          >
            {footer}
          </div>
        )}
      </>
    ),
    [children, classes?.children, classes?.footer, footer],
  );

  return (
    <div
      className={clsx(
        'bg-card text-card-foreground rounded-xl border p-6',
        className,
        classes?.root,
      )}
      data-slot="card"
    >
      {hasHeader && (
        <div
          className={clsx(
            '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
            classes?.header,
          )}
          data-slot="card-header"
        >
          {(!!badgeText || !!status) && (
            <div>
              <Badge
                className={clsx(classes?.badge, 'mb-2 text-xs float-left')}
                variant={badgeVariant}
              >
                {badgeText}
              </Badge>
              <Badge
                className={clsx([classes?.status, 'text-xs float-right'])}
                variant="plain"
              >
                {status}
              </Badge>
            </div>
          )}
          {(!!title || !!action || collapsible) && (
            <div
              className={clsx(
                'flex gap-4 items-start transition-pb duration-300 ease-in-out',
                isCollapsed ? ' -mb-1.5' : 'pb-2',
              )}
            >
              <h3
                className={clsx(['flex-1 leading-none', classes?.title])}
                data-slot="card-title"
              >
                {title}
              </h3>
              {!!action && <div className="ml-auto">{action}</div>}
              {!!collapsible && (
                <Clickable onClick={() => setIsCollapsed(!isCollapsed)}>
                  {isCollapsed ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Clickable>
              )}
            </div>
          )}
          {!!description && (
            <div
              className={clsx(classes?.description, 'text-muted-foreground')}
              data-slot="card-description"
            >
              {description}
            </div>
          )}
        </div>
      )}

      {collapsible ? (
        <div
          className={clsx([
            'overflow-hidden transition-max-h duration-300 ease-in-out',
            isCollapsed ? 'max-h-0' : 'max-h-[1000px]',
          ])}
        >
          {childrenAndFooter}
        </div>
      ) : (
        childrenAndFooter
      )}
    </div>
  );
}

export default memo(Card);
