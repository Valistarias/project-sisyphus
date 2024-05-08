import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import holoBackground from '../assets/imgs/tvbg.gif';
import { Ap } from '../atoms';
import DiceCard from '../molecules/diceCard';
import { type TypeDice, type TypeRoll } from '../types';

import { classTrim, strTodiceResult } from '../utils';

import './rollResult.scss';

interface IRollResult {
  /** The total result of the dice roll */
  result: number;
  /** The name of the author of the dice roll */
  authorName: string;
  /** The formula of each die */
  formula: string;
  /** When the die was rolled */
  createdAt: Date;
  /** The type of the roll */
  type: TypeRoll;
}

const RollResult: FC<IRollResult> = ({ result, authorName, formula, createdAt, type }) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);

  const detailScores = useMemo(() => {
    const dicesToUse: Array<{
      id: number;
      type: number;
      value: number;
    }> = [];
    let idDie = 0;
    strTodiceResult(formula).forEach((diceCat) => {
      if (diceCat.results.length > 0) {
        diceCat.results.forEach((result) => {
          dicesToUse.push({
            id: idDie,
            type: diceCat.type,
            value: result,
          });
          idDie += 1;
        });
      }
    });

    return dicesToUse.map(({ id, type, value }, index) => (
      <DiceCard key={id} type={type as TypeDice} value={value} size="xsmall" skip />
    ));
  }, [formula]);

  const typeRolltext = useMemo(() => {
    return (
      <Ap className="roll-result__result__type__text">
        <span className="roll-result__result__type__text__long">
          {t('rollResults.freeRoll1', { ns: 'components' })}
        </span>{' '}
        {t('rollResults.freeRoll2', { ns: 'components' })}
      </Ap>
    );
  }, [t]);

  return (
    <div className="roll-result">
      <Ap className="roll-result__hour">{`${createdAt.toLocaleDateString()} - ${createdAt.getHours()}:${createdAt.getMinutes()}`}</Ap>
      <div
        className={classTrim(`
          roll-result__result
        `)}
        style={{ backgroundImage: `url(${holoBackground})` }}
      >
        <div className="roll-result__result__type">{typeRolltext}</div>
        <div className="roll-result__result__content">
          <Ap className="roll-result__result__content__character">{authorName}</Ap>
          <Ap
            onClick={() => {
              setOpen((prev) => !prev);
            }}
            className="roll-result__result__content__score"
          >
            {result.toString()}
          </Ap>
        </div>
      </div>
      {isOpen ? (
        <div className="roll-result__info">
          <div className="roll-result__info__arrow" />
          <div className="roll-result__info__content">{detailScores}</div>
        </div>
      ) : null}
    </div>
  );
};

export default RollResult;
