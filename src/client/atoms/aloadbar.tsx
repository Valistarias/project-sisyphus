import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aloadbar.scss';

interface IAloadbar extends IQuarkProps {
  /** The main color of the Aloadbar */
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  /** Value from 0 to 1 that determine how much the bar had progressed */
  progress: number;
  /** Is the Progress Bar changing color when a specific threshold is passed (fixed) */
  withDangerZone: boolean;
}

const Aloadbar: FC<IAloadbar> = ({
  className,
  withDangerZone = false,
  progress,
  color = 'primary',
  htmlFor,
}) => (
  <Quark
    quarkType="div"
    htmlFor={htmlFor}
    className={classTrim(`
        loadbar
        loadbar--${color}
        ${withDangerZone && progress < 0.4 ? 'loadbar--danger' : ''}
        ${className ?? ''}
      `)}
  >
    <div className="loadbar__progress" style={{ width: `${progress * 100}%` }} />
  </Quark>
);

export default Aloadbar;
