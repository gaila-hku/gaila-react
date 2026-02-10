import * as React from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react/tabs';
import clsx from 'clsx';

import styles from './index.module.css';

type Props = {
  tabs: {
    key: string;
    title: React.ReactNode;
    content: React.ReactNode;
  }[];
  defaultTab?: string;
  tabValue?: string;
  classes?: {
    tab?: string;
    indicator?: string;
    tabListWrapper?: string;
    tabList?: string;
    panel?: string;
    root?: string;
  };
  className?: string;
  onClick?: (key: string) => void;
  style?: React.CSSProperties;
};

function Tabs({
  tabs,
  defaultTab,
  tabValue,
  classes,
  className,
  onClick,
  style,
}: Props) {
  if (!tabs.length) {
    return <></>;
  }

  return (
    <BaseTabs.Root
      className={clsx(styles.tabs, classes?.root, className)}
      defaultValue={defaultTab || tabs[0].key}
      style={style}
      value={tabValue}
    >
      <div className={clsx('bg-white', classes?.tabListWrapper)}>
        <BaseTabs.List className={clsx(styles.list, classes?.tabList)}>
          {tabs.map(tab => (
            <BaseTabs.Tab
              className={clsx(styles.tab, classes?.tab)}
              key={tab.key}
              onClick={onClick ? () => onClick(tab.key) : undefined}
              value={tab.key}
            >
              {tab.title}
            </BaseTabs.Tab>
          ))}
          <BaseTabs.Indicator
            className={clsx(styles.indicator, classes?.indicator)}
          />
        </BaseTabs.List>
      </div>
      {tabs.map(tab => (
        <BaseTabs.Panel
          className={clsx(styles.panel, classes?.panel)}
          key={tab.key}
          value={tab.key}
        >
          {tab.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}

export default Tabs;
