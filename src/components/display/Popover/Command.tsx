import * as React from 'react';

import clsx from 'clsx';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';

type Props = {
  includeSearch?: boolean;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  className?: string;
  searchClassName?: string;
  extra?: React.ReactNode;
} & React.ComponentProps<typeof CommandPrimitive>;

function Command({
  includeSearch,
  onSearchChange,
  searchPlaceholder,
  emptyPlaceholder,
  className,
  searchClassName,
  children,
  extra,
  ...props
}: Props) {
  return (
    <CommandPrimitive
      className={clsx(
        'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
        className,
      )}
      data-slot="command"
      {...props}
    >
      {extra}
      {includeSearch && (
        <div
          className="flex h-9 items-center gap-2 border-b px-3"
          data-slot="command-input-wrapper"
        >
          <SearchIcon className="size-4 shrink-0 opacity-50" />
          <CommandPrimitive.Input
            className={clsx(
              'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
              searchClassName,
            )}
            data-slot="command-input"
            onValueChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
      )}
      <CommandPrimitive.List
        className={clsx(
          'max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto',
          className,
        )}
        data-slot="command-list"
      >
        <CommandPrimitive.Empty
          className="py-6 text-center text-sm"
          data-slot="command-empty"
        >
          {emptyPlaceholder}
        </CommandPrimitive.Empty>

        <CommandPrimitive.Group
          className={clsx(
            'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
            className,
          )}
          data-slot="command-group"
        >
          {children}
        </CommandPrimitive.Group>
      </CommandPrimitive.List>
    </CommandPrimitive>
  );
}

export function CommandItem({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={clsx(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="command-item"
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  );
}

export default Command;
