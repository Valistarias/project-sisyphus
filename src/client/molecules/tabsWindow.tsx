import React, { type ReactNode, type FC } from 'react';

import Button from './button';

import './tabsWindow.scss';

interface ITabsWindow {
  /** The tab displayed */
  displayedTab: string | null
  /** The tabs to display */
  tabs: Array<{
    label: string
    id: string
    content: ReactNode
  }>
  /** When a tab button is clicked */
  onClick: (tabId: string) => void
}

const TabsWindow: FC<ITabsWindow> = ({
  displayedTab,
  tabs,
  onClick: onTabLabelClick
}) => (
  <div className="tabs-window">
    <div className="tabs-window__buttons">
      {
        tabs.map(({ label, id }) => (
          <Button
            key={id}
            onClick={() => {
              onTabLabelClick(id);
            }}
          >
            {label}
          </Button>
        ))
      }
    </div>
    <div className="tabs-window__window">
      { tabs.find(({ id }) => id === displayedTab)?.content }
    </div>
  </div>
);

export default TabsWindow;
