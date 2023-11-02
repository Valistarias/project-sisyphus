import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './ali.scss';

interface IAli {
  /** The class of the LI element */
  className?: string;
  /** The childrens of the LI element */
  children: React.JSX.Element | React.JSX.Element[];
}

const Ali: FC<IAli> = ({ className, children }) => (
  <li
    className={classTrim(`
        ali
        ${className ?? ''}
      `)}
  >
    {children}
  </li>
);

export default Ali;
