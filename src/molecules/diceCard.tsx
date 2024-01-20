import React, { useEffect, useRef, useState, type FC } from 'react';

import holoBackground from '../assets/imgs/tvbg.gif';
import { Aicon, Ap, type typeIcons } from '../atoms';

import { type typeDice } from '../interfaces';

import { classTrim, degToRad } from '../utils';

import './diceCard.scss';

interface IDiceCard {
  /** The type of dice displayed */
  type: typeDice;
  /** The number got */
  value?: number | null;
  /** The size of the card */
  size?: 'small' | 'medium' | 'large' | 'single';
  /** Is the card to be skipped ? */
  skip?: boolean;
}

// const totalTicks = 500;

const DiceCard: FC<IDiceCard> = ({ type, value, size = 'medium', skip = false }) => {
  const [displayedValue, setDisplayedValue] = useState(0);

  const intervalTick = useRef<NodeJS.Timeout | null>(null);
  const totalTicks = useRef<number>(0);
  const tick = useRef<number>(0);

  useEffect(() => {
    if (value != null) {
      setDisplayedValue(0);
      totalTicks.current = value * 5;
      const begin = -90;
      const end = 0;
      const totalSteps = end - begin;
      const singleStep = totalSteps / totalTicks.current;

      intervalTick.current = setInterval(() => {
        tick.current += 1;
        const actualStep = singleStep * tick.current;
        const actualDeg = Math.cos(degToRad(begin + actualStep));
        setDisplayedValue(Math.floor(actualDeg * value));
        if (tick.current >= totalTicks.current && intervalTick.current !== null) {
          clearTimeout(intervalTick.current);
        }
      }, 400 / value);
    } else {
      if (intervalTick.current !== null) {
        clearTimeout(intervalTick.current);
        intervalTick.current = null;
      }
      totalTicks.current = 0;
      tick.current = 0;
    }
  }, [value]);

  useEffect(() => {
    if (skip && intervalTick.current !== null) {
      clearTimeout(intervalTick.current);
    }
  }, [skip]);

  useEffect(() => {
    return () => {
      if (intervalTick.current !== null) {
        clearTimeout(intervalTick.current);
        intervalTick.current = null;
      }
      totalTicks.current = 0;
      tick.current = 0;
    };
  }, []);

  return (
    <div
      className={classTrim(`
      dice-card
      dice-card--${size}
      ${value !== null ? 'dice-card--visible' : ''}
      ${value === 1 && type > 4 ? 'dice-card--fumble' : ''}
      ${value === type ? 'dice-card--max' : ''}
    `)}
      style={{ backgroundImage: `url(${holoBackground})` }}
    >
      <Aicon type={`d${type}` as typeIcons} className="dice-card__dice-bg" size="unsized" />
      <Ap className="dice-card__value">
        {skip && value != null ? value.toString() : displayedValue.toString()}
      </Ap>
    </div>
  );
};

export default DiceCard;
