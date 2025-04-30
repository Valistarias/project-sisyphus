import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Ap } from '../../atoms';
import { TabsWindow } from '../../molecules';

import CharacterActionList from './characterActionList';
import CharacterInventory from './characterInventory';
import CharacterProgramList from './characterProgramList';

import type { TypeCampaignEvent } from '../../types';

import { classTrim, type DiceRequest } from '../../utils';

import './characterBoard.scss';

interface ICharacterBoard {
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[], id: TypeCampaignEvent) => void;
}

const CharacterBoard: FC<ICharacterBoard> = ({ onRollDices }) => {
  const { t } = useTranslation();

  const [displayedTab, setDisplayedTab] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      {
        label: t('characterBoard.tabs.actions', { ns: 'components' }),
        id: 'actions',
        content: <CharacterActionList onRollDices={onRollDices} />,
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
    [onRollDices, t]
  );

  return (
    <div
      className={classTrim(`
        char-action-board
      `)}
    >
      <TabsWindow
        displayedTab={displayedTab}
        className="char-action-board__tabs"
        onClick={(tabId) => {
          setDisplayedTab(tabId);
        }}
        tabs={tabs}
      />
      <Ap className="char-action-board__title">{t('terms.action.name', { count: 2 })}</Ap>
    </div>
  );
};

export default CharacterBoard;
