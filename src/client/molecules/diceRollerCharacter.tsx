import React, { type ReactNode, type FC } from 'react';

import { Ap } from '../atoms';

import { classTrim } from '../utils';

import './diceRollerCharacter.scss';

interface IDiceRollerCharacter {
  /** The value to display */
  val?: ReactNode;
  /** The size of the dice roller character */
  size?: 'xlarge' | 'large' | 'medium' | 'small';
  /** Is the character under cursor ? */
  cursor?: boolean;
  /** Is the character feded out ? */
  faded?: boolean;
  /** The added class to the element */
  className?: string;
}

const DiceRollerCharacter: FC<IDiceRollerCharacter> = ({ size, cursor, faded, val, className }) => (
  <Ap
    className={classTrim(`
      dice-roller-char
      dice-roller-char--${size}
      ${cursor !== undefined && cursor ? 'dice-roller-char--cursor' : ''}
      ${faded !== undefined && faded ? 'dice-roller-char--faded' : ''}
      ${className ?? ''}
    `)}
  >
    {val}
  </Ap>
);

export default DiceRollerCharacter;
