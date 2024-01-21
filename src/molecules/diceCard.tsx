import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

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

// Animation numbers -------------------------------------
// Number of ticks before the animation finishes
const totalTicks = 300;
// The duration of a tick, in milliseconds
const tickDuration = 1;
// How many random numbers are displayed in the available time
const displayedRandNumber = 15;

// Degree values for cosine curve (DO NOT TOUCH)
const _beginAnimDegree = 0;
const _endAnimDegree = 90;
const _totalStepAnim = _endAnimDegree - _beginAnimDegree;
const _singleStepAnim = _totalStepAnim / totalTicks;

// Score to attain for new random number displayed
const randNumberTreshold = 1 / displayedRandNumber;
// -------------------------------------------------------

const DiceCard: FC<IDiceCard> = ({ type, value, size = 'medium', skip = false }) => {
  const [displayedValue, setDisplayedValue] = useState(0);
  const [animEnded, setAnimEnded] = useState(false);

  const intervalTick = useRef<NodeJS.Timeout | null>(null);
  const tick = useRef<number>(0);
  const storedThreshold = useRef<number>(0);

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
        const previousTick = tick.current;
        tick.current += 1;

        const actualStep = _singleStepAnim * tick.current;
        const actualDeg = Math.sin(degToRad(_beginAnimDegree + actualStep));

        const previousStep = _singleStepAnim * previousTick;
        const previousDeg = Math.sin(degToRad(_beginAnimDegree + previousStep));

        const delta = actualDeg - previousDeg;

        // Animate a number
        if (storedThreshold.current + delta >= randNumberTreshold || actualDeg === 1) {
          storedThreshold.current = 0;
          // console.log('actualDeg', actualDeg);
          if (actualDeg === 1) {
            setDisplayedValue(value);
          } else {
            setDisplayedValue(Math.floor(Math.random() * type) + 1);
          }
        } else {
          storedThreshold.current += delta;
        }
        if (tick.current >= totalTicks && intervalTick.current !== null) {
          setAnimEnded(true);
          clearTimeout(intervalTick.current);
        }
      }, tickDuration);
    } else {
      if (intervalTick.current !== null) {
        clearTimeout(intervalTick.current);
        intervalTick.current = null;
      }
      tick.current = 0;
      storedThreshold.current = 0;
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
