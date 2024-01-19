import React, { type FC } from 'react';

import holoBackground from '../assets/imgs/tvbg.gif';
import { Aicon, Ap, type typeIcons } from '../atoms';

import { type typeDice } from '../interfaces';

import { classTrim } from '../utils';

import './diceCard.scss';

interface IDiceCard {
  /** The type of dice displayed */
  type: typeDice;
  /** The number got */
  value: number | null;
  /** The size of the card */
  size?: 'small' | 'medium' | 'single';
}

const DiceCard: FC<IDiceCard> = ({ type, value, size = 'medium' }) => {
  return (
    <div
      className={classTrim(`
      dice-card
      dice-card--${size}
    `)}
      style={{ backgroundImage: `url(${holoBackground})` }}
    >
      <Aicon type={`d${type}` as typeIcons} className="dice-card__dice-bg" size="unsized" />
      {value != null ? <Ap className="dice-card__value">{value.toString()}</Ap> : null}
    </div>
  );
};

export default DiceCard;
