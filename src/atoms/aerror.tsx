import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './aerror.scss';

interface IAerror {
  /** The class of the P element */
  className?: string;
  /** The childrens of the P element */
  children: React.JSX.Element | string | string[];
}

const Aerror: FC<IAerror> = ({ className, children }) => (
  <p
    className={classTrim(`
        aerror
        ${className ?? ''}
      `)}
  >
    {children}
  </p>
);

export default Aerror;
