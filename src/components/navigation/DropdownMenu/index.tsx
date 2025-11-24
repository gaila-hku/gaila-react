import React, { useCallback } from 'react';

import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Divider from 'components/display/Divider';
import Clickable from 'components/input/Clickable';

type MenuItem<T> =
  | {
      key: T;
      label: React.ReactNode;
      icon?: React.ReactNode;
    }
  | {
      type: 'divider';
    }
  | {
      type: 'text';
      label: React.ReactNode;
    };

type ItemProps<T> = {
  items: MenuItem<T>[];
  onClick?: (key: T) => void;
};

type MenuChildrenProps = {
  menuChildren: React.ReactNode[];
};

type Props<T extends string | number> = (ItemProps<T> | MenuChildrenProps) & {
  sx?: MenuProps['sx'];
  keepMounted?: boolean;
  children: React.ReactNode;
};

function DropdownMenu<T extends string | number>({
  children,
  sx,
  keepMounted,
  ...props
}: Props<T>) {
  const items = 'items' in props ? props.items : [];
  const inputOnClick = 'onClick' in props ? props.onClick : undefined;
  const menuChildren = 'menuChildren' in props ? props.menuChildren : undefined;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const onClickMenuItem = useCallback(
    (key: T) => {
      handleClose();
      inputOnClick?.(key);
    },
    [handleClose, inputOnClick],
  );

  const renderMenuItem = useCallback(
    (item: MenuItem<T>) => {
      if ('key' in item) {
        return (
          <MenuItem key={item.key} onClick={() => onClickMenuItem(item.key)}>
            {!!item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            {item.label}
          </MenuItem>
        );
      } else if (item.type === 'divider') {
        return <Divider className="!mb-1" key={item.type} />;
      }
      return <div className="px-4">{item.label}</div>;
    },
    [onClickMenuItem],
  );

  return (
    <>
      <Clickable onClick={handleOpen}>{children}</Clickable>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        keepMounted={keepMounted}
        onClick={handleClose}
        onClose={handleClose}
        open={open}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 5,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
              '& > ul': {
                pt: 1.5,
                pb: 0,
              },
              '& > ul > li, & > ul > div': {
                pt: 0,
                pb: 1.5,
              },
              '& > ul > hr': {
                mb: 1.5,
              },
            },
          },
        }}
        sx={{ '& .MuiMenuItem-root': { py: 1 }, ...sx }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {menuChildren || items.map(renderMenuItem)}
      </Menu>
    </>
  );
}

export default DropdownMenu;
