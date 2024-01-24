import React, { Fragment, useMemo, useState, type FC } from 'react';

import holoBackground from '../assets/imgs/tvbg.gif';
import { Ap } from '../atoms';
import DiceCard from '../molecules/diceCard';

import { classTrim } from '../utils';

import './rollResult.scss';

interface IRollResult {}

const RollResult: FC<IRollResult> = ({}) => {
  const [isOpen, setOpen] = useState(false);

  const detailScores = useMemo(() => {
    return [
      <Fragment key="test">
        <DiceCard type={20} value={4} size="xsmall" skip />
        <Ap className="roll-result__info__plus">+</Ap>
      </Fragment>,
      <DiceCard key="test2" type={20} value={8} size="xsmall" skip />,
    ];
  }, []);

  return (
    <div className="roll-result">
      <Ap className="roll-result__hour">24/01/2024 - 23:32</Ap>
      <div
        className={classTrim(`
        roll-result__result
      `)}
        style={{ backgroundImage: `url(${holoBackground})` }}
      >
        <Ap className="roll-result__result__type">Free Roll</Ap>
        <div className="roll-result__result__content">
          <Ap className="roll-result__result__content__character">Galmur Copperstone</Ap>
          <Ap
            onClick={() => {
              setOpen((prev) => !prev);
            }}
            className="roll-result__result__content__score"
          >
            12
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
