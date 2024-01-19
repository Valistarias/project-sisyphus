import React, { useMemo, useState, type FC } from 'react';

import { Aicon, Ap } from '../atoms';
import { type typeIcons } from '../atoms/aicon';
import { Button } from '../molecules';

import { classTrim } from '../utils';

import './rollTab.scss';

interface IRollTab {
  /** The ID used on the alert provider */
  onRollDices: () => void;
}

const RollTab: FC<IRollTab> = ({ onRollDices }) => {
  // const { t } = useTranslation();

  const [isOpen, setOpen] = useState(true);

  const typeDices = useMemo(() => ['d20', 'd12', 'd10', 'd8', 'd6', 'd4'], []);

  return (
    <div
      className={classTrim(`
          roll-tab
          ${isOpen ? 'roll-tab--open' : ''}
        `)}
    >
      <Button
        theme={isOpen ? 'afterglow' : 'solid'}
        className="roll-tab__button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        {isOpen ? 'Close' : 'Dices'}
      </Button>
      <div className="roll-tab__table">
        {typeDices.map((typeDice) => (
          <Button key={typeDice} theme="solid" className="roll-tab__table__button" size="xlarge">
            <Ap>{typeDice}</Ap>
            <Aicon
              type={typeDice as typeIcons}
              className="roll-tab__table__button__icon"
              size="large"
            />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RollTab;
