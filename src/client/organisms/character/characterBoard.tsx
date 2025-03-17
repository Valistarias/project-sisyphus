import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { TabsWindow } from '../../molecules';

import CharacterActionList from './characterActionList';
import CharacterInventory from './characterInventory';
import CharacterProgramList from './characterProgramList';

import { classTrim } from '../../utils';

import './characterBoard.scss';

const CharacterBoard: FC = () => {
  const { t } = useTranslation();

  const [displayedTab, setDisplayedTab] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      {
        label: t('characterBoard.tabs.actions', { ns: 'components' }),
        id: 'actions',
        content: <CharacterActionList />,
      },
      {
        label: t('characterBoard.tabs.programs', { ns: 'components' }),
        id: 'programs',
        content: <CharacterProgramList />,
      },
      {
        label: t('characterBoard.tabs.inventory', { ns: 'components' }),
        id: 'inventory',
        content: <CharacterInventory />,
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

export default CharacterBoard;
