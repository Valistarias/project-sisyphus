import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { TabsWindow } from '../../molecules';

import CharacterActionList from './characterActionList';

import { classTrim } from '../../utils';

import './characterActionBoard.scss';

const CharacterActionBoard: FC = () => {
  const { t } = useTranslation();

  const [displayedTab, setDisplayedTab] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      {
        label: t('characterActionBoard.tabs.actions', { ns: 'components' }),
        id: 'actions',
        content: <CharacterActionList />,
      },
      {
        label: t('characterActionBoard.tabs.programs', { ns: 'components' }),
        id: 'programs',
        content: <p>This is test 2</p>,
      },
      {
        label: t('characterActionBoard.tabs.inventory', { ns: 'components' }),
        id: 'inventory',
        content: <p>This is test 3</p>,
      },
    ],
    [t]
  );

  return (
    <div
      className={classTrim(`
      char-action-board
    `)}
    >
      <TabsWindow
        displayedTab={displayedTab}
        onClick={(tabId) => {
          setDisplayedTab(tabId);
        }}
        tabs={tabs}
      />
    </div>
  );
};

export default CharacterActionBoard;
