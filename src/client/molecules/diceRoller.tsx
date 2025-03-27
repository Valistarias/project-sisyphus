import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useSoundSystem } from '../providers';

import { Aicon, type typeIcons } from '../atoms';

import DiceRollerCharacter from './diceRollerCharacter';

import { classTrim, type UniqueResultDiceData } from '../utils';

import './diceRoller.scss';

interface IDiceRoller {
  /** The position on the display, to determine delay on animations */
  position: number;
  /** The dice value */
  value: UniqueResultDiceData;
  /** This function is called when animation ended */
  onAnimationEnd: () => void;
  /** The size of the dice roller */
  size?: 'xlarge' | 'large' | 'medium' | 'small';
  /** Is an icon present with the roller */
  withIcon: boolean;
  /** The added class to the element */
  className?: string;
}

const speedTick = 80;
const speedMidPause = 1000;

const DiceRoller: FC<IDiceRoller> = ({
  position,
  value,
  onAnimationEnd,
  size = 'medium',
  className,
  withIcon,
}) => {
  const [randomBinary, setRandomBinary] = useState<number[]>([]);
  const rollingRandom = useRef(true);
  const basicAnimationRolling = useRef(false);
  const returnAnimationRolling = useRef(false);
  const { tone, timedTone } = useSoundSystem();

  const [cursorPos, setCursorPos] = useState(0);
  const [mode, setMode] = useState<'randToBin' | 'binToDec'>('randToBin');

  const binaryCharacters = useMemo(() => {
    const binaryLength = value.type.toString(2).length;
    const valueToBinary = value.value.toString(2);

    const binaries: number[] = [
      ...Array(binaryLength - valueToBinary.length).fill(0),
      ...valueToBinary.split('').map((val) => Number(val)),
    ];

    return binaries;
  }, [value]);

  const decimalCharacters = useMemo(() => {
    const binaryLength = value.type.toString(2).length;
    const stringVal = value.value.toString();

    const binaries: Array<{
      val: number;
      rounding: boolean;
    }> = [
      ...Array(binaryLength - stringVal.length)
        .fill(0)
        .map((val) => ({
          val,
          rounding: true,
        })),
      ...stringVal.split('').map((val) => ({
        val: Number(val),
        rounding: false,
      })),
    ];

    return binaries;
  }, [value]);

  useEffect(() => {
    if (!basicAnimationRolling.current) {
      basicAnimationRolling.current = true;
      let indexPosCursor = value.type.toString(2).length + 1;
      setCursorPos(indexPosCursor);

      setRandomBinary(
        Array(value.type.toString(2).length)
          .fill(0)
          .map(() => Math.round(Math.random()))
      );
      // Random Generator
      const animation = setInterval(
        () => {
          if (!rollingRandom.current) {
            clearInterval(animation);
          } else {
            // Trigger the tone one of two times
            timedTone(0.4);
            setRandomBinary(
              Array(value.type.toString(2).length)
                .fill(0)
                .map(() => Math.round(Math.random()))
            );
          }
        },
        Math.floor(Math.random() * 400) + 200
      );

      // First animation -> Random to binary value
      setTimeout(
        () => {
          // Stopping random generator animation
          rollingRandom.current = false;
          const animationRoll = setInterval(() => {
            // Value = numbers from finish to start (plus empty element at start and at the end)
            if (indexPosCursor === 0) {
              clearInterval(animationRoll);
              setMode('binToDec');
            } else {
              indexPosCursor--;
              setCursorPos(indexPosCursor);
              tone(0.8);
            }
          }, speedTick);
        },
        2400 + 50 * position
      );
    }
  }, [position, value.type, tone, timedTone]);

  useEffect(() => {
    if (!returnAnimationRolling.current && mode === 'binToDec') {
      returnAnimationRolling.current = true;

      setTimeout(() => {
        let indexPosCursor = 0;
        const animationRoll = setInterval(() => {
          // Value = numbers from finish to start (plus empty element at start and at the end)
          if (indexPosCursor === value.type.toString(2).length + 1) {
            clearInterval(animationRoll);
            onAnimationEnd();
          } else {
            indexPosCursor++;
            setCursorPos(indexPosCursor);
            tone();
          }
        }, speedTick);
      }, speedMidPause);
    }
  }, [mode, value.type, tone, onAnimationEnd]);

  return (
    <div
      className={classTrim(`
        dice-roller
        dice-roller--${size}
        ${withIcon ? 'dice-roller--with-icon' : ''}
        ${className ?? ''}
      `)}
    >
      <DiceRollerCharacter
        className="dice-roller__char dice-roller__char--first"
        val={
          withIcon ? (
            <Aicon
              type={`D${value.type}` as typeIcons}
              className="dice-roller__char__icon"
              size="large"
            />
          ) : null
        }
        cursor={cursorPos === 0}
        size={size}
      />
      {/* <div
        className={classTrim(`
            dice-roller__char
            dice-roller__char--first
            ${cursorPos === 0 ? 'dice-roller__char--cursor' : ''}
          `)}
      >
        {withIcon && (
          <Aicon
            type={`D${value.type}` as typeIcons}
            className="dice-roller__char__icon"
            size="large"
          />
        )}
      </div> */}
      {binaryCharacters.map((_, index) => {
        let val = 0;
        if (mode === 'randToBin') {
          if (cursorPos > index) {
            val = randomBinary[index];
          } else {
            val = binaryCharacters[index];
          }
        } else {
          if (cursorPos <= index) {
            val = binaryCharacters[index];
          } else {
            ({ val } = decimalCharacters[index]);
          }
        }

        return (
          <DiceRollerCharacter
            key={index}
            className="dice-roller__char"
            val={val}
            cursor={cursorPos === index + 1}
            faded={
              mode === 'binToDec' && cursorPos >= index + 2 && decimalCharacters[index].rounding
            }
            size={size}
          />
        );
      })}
      <div
        className={classTrim(`
          dice-roller__char
          dice-roller__char--last
          ${cursorPos === randomBinary.length + 1 ? 'dice-roller__char--cursor' : ''}
        `)}
      />
      <DiceRollerCharacter className="dice-roller__char dice-roller__char--last" size={size} />
    </div>
  );
};

export default DiceRoller;
