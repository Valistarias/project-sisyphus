import React, {
  type FC
} from 'react';

import { useGlobalVars } from '../../providers';

import {
  classTrim
} from '../../utils';

import './characterActionBoard.scss';

const CharacterActionBoard: FC = () => {
  const { character } = useGlobalVars();

  console.log('character', character);

  return (
    <div
      className={classTrim(`
      char-action-board
    `)}
    />
  );
};

export default CharacterActionBoard;
