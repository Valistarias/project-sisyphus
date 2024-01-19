import React, { useCallback, useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Aicon, Ap, type typeIcons } from '../atoms';
import { Button } from '../molecules';

import { classTrim, type DiceRequest } from '../utils';

import './rollTab.scss';

interface IRollTab {
  /** The ID used on the alert provider */
  onRollDices: (diceValues: DiceRequest[]) => void;
}

const initRollTab: DiceRequest[] = [
  {
    type: 20,
    qty: 0,
  },
  {
    type: 12,
    qty: 0,
  },
  {
    type: 10,
    qty: 0,
  },
  {
    type: 8,
    qty: 0,
  },
  {
    type: 6,
    qty: 0,
  },
  {
    type: 4,
    qty: 0,
  },
];

const RollTab: FC<IRollTab> = ({ onRollDices }) => {
  const { t } = useTranslation();

  const [isOpen, setOpen] = useState(true);

  const [diceValues, setDiceValues] = useState<DiceRequest[]>(initRollTab);

  const canRoll = useMemo(() => diceValues.some(({ qty }) => qty > 0), [diceValues]);

  const changeDice = useCallback((dice: number, type: 'add' | 'remove') => {
    setDiceValues((prevDiceValues: DiceRequest[]) => {
      const newDiceValues = prevDiceValues.map((diceObj) => {
        if (diceObj.type === dice) {
          if (type === 'remove' && diceObj.qty > 0) {
            return {
              ...diceObj,
              qty: diceObj.qty - 1,
            };
          } else if (type === 'add') {
            return {
              ...diceObj,
              qty: diceObj.qty + 1,
            };
          }
        }
        return diceObj;
      });
      return newDiceValues;
    });
  }, []);

  const diceElts = useMemo(
    () =>
      diceValues.map(({ type: typeDiceNumber }) => {
        const diceElt = diceValues.find((diceValue) => diceValue.type === typeDiceNumber);
        if (diceElt != null) {
          return (
            <Button
              key={typeDiceNumber}
              theme="solid"
              className="roll-tab__table__button"
              size="xlarge"
              onContextMenu={(e) => {
                e.preventDefault();
                changeDice(typeDiceNumber, 'remove');
              }}
              onClick={(e) => {
                e.preventDefault();
                changeDice(typeDiceNumber, 'add');
              }}
              active={diceElt.qty > 0}
            >
              <Ap>{`${diceElt.qty > 0 ? diceElt.qty : ''}D${typeDiceNumber}`}</Ap>
              <Aicon
                type={`d${typeDiceNumber}` as typeIcons}
                className="roll-tab__table__button__icon"
                size="large"
              />
            </Button>
          );
        }
        return null;
      }),
    [changeDice, diceValues]
  );

  return (
    <div
      className={classTrim(`
          roll-tab
          ${isOpen ? 'roll-tab--open' : ''}
        `)}
    >
      <div className="roll-tab__buttons">
        <Button
          theme="solid"
          active
          className={classTrim(`
            roll-tab__buttons__roll
              ${canRoll ? 'roll-tab__buttons__roll--visible' : ''}
            `)}
          onClick={() => {
            onRollDices(diceValues);
            setDiceValues(initRollTab);
          }}
        >
          {t('rollTab.roll', { ns: 'components' })}
        </Button>
        <Button
          theme="solid"
          className="roll-tab__buttons__toggle"
          onClick={() => {
            if (isOpen) {
              setDiceValues(initRollTab);
            }
            setOpen(!isOpen);
          }}
        >
          {isOpen
            ? t('rollTab.close', { ns: 'components' })
            : t('rollTab.dices', { ns: 'components' })}
        </Button>
      </div>

      <div className="roll-tab__table">{diceElts}</div>
    </div>
  );
};

export default RollTab;
