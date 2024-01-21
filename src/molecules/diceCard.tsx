import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import holoBackground from '../assets/imgs/tvbg.gif';
import { Aicon, Ap, type typeIcons } from '../atoms';

import { type typeDice } from '../interfaces';

import { classTrim } from '../utils';

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

// Number of ticks before the animation finishes
const totalTicks = 200;
// The duration of a tick, in milliseconds
const tickDuration = 3;

const displayedRandNumber = 20;
const _beginAnim = 0;
const _endAnim = 1;
const _totalStepAnim = _endAnim - _beginAnim;
const _singleStepAnim = _totalStepAnim / totalTicks;

// Score to attain for new random number displayed
const randNumberTreshold = _totalStepAnim / displayedRandNumber;

const DiceCard: FC<IDiceCard> = ({ type, value, size = 'medium', skip = false }) => {
  const [displayedValue, setDisplayedValue] = useState(0);
  const [animEnded, setAnimEnded] = useState(false);

  const intervalTick = useRef<NodeJS.Timeout | null>(null);
  const tick = useRef<number>(0);
  const storedThreshold = useRef<number>(0);
  const totalLeft = useRef<number>(_endAnim);

  const displayedNumberString = useMemo(() => {
    if (skip && value != null) {
      if (type >= 10 && value < 10) {
        return `0${value}`;
      }
      return value.toString();
    }
    if (type >= 20 && displayedValue < 10 && !animEnded) {
      return `0${displayedValue}`;
    }
    return displayedValue.toString();
  }, [displayedValue, skip, type, value, animEnded]);

  useEffect(() => {
    if (value != null) {
      setDisplayedValue(0);
      intervalTick.current = setInterval(() => {
        tick.current += 1;

        const actualVal = totalLeft.current / totalTicks;
        totalLeft.current -= _singleStepAnim;

        // Animate a number
        if (intervalTick.current !== null && tick.current >= totalTicks) {
          clearTimeout(intervalTick.current);
          setTimeout(() => {
            setDisplayedValue(value);
            setAnimEnded(true);

            totalLeft.current = _endAnim;
          }, 200);
        } else if (storedThreshold.current + actualVal >= randNumberTreshold) {
          storedThreshold.current = 0;
          setDisplayedValue(Math.floor(Math.random() * type) + 1);
        } else {
          storedThreshold.current += actualVal;
        }
      }, tickDuration);
    } else {
      if (intervalTick.current !== null) {
        clearTimeout(intervalTick.current);
        intervalTick.current = null;
      }
      tick.current = 0;
      storedThreshold.current = 0;
      totalLeft.current = _endAnim;
    }
  }, [value, type]);

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
      tick.current = 0;
      storedThreshold.current = 0;
    };
  }, []);

  return (
    <div
      className={classTrim(`
      dice-card
      dice-card--${size}
      ${animEnded ? 'dice-card--end' : ''}
      ${value !== null ? 'dice-card--visible' : ''}
      ${value === 1 && type > 4 ? 'dice-card--fumble' : ''}
      ${value === type ? 'dice-card--max' : ''}
    `)}
      style={{ backgroundImage: `url(${holoBackground})` }}
    >
      <Aicon type={`d${type}` as typeIcons} className="dice-card__dice-bg" size="unsized" />
      <Ap className="dice-card__value">{displayedNumberString}</Ap>
    </div>
  );
};

export default DiceCard;
