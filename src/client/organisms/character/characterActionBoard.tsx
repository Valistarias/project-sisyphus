import React, {
  useState,
  type FC
} from 'react';

import { useGlobalVars } from '../../providers';

import { TabsWindow } from '../../molecules';

import {
  classTrim
} from '../../utils';

import './characterActionBoard.scss';

const CharacterActionBoard: FC = () => {
  const { character } = useGlobalVars();

  const [displayedTab, setDisplayedTab] = useState<string | null>(null);

  console.log('character', character);

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
        tabs={[
          {
            label: 'Test 1',
            id: '1',
            content: (
              <p>This is test 1</p>
            )
          },
          {
            label: 'Test 2',
            id: '2',
            content: (
              <p>This is test 2</p>
            )
          },
          {
            label: 'Test 3',
            id: '3',
            content: (
              <p>This is test 3</p>
            )
          }
        ]}
      />
    </div>
  );
};

export default CharacterActionBoard;
