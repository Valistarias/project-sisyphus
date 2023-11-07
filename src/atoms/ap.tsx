import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './ap.scss';

interface IAp {
  /** The class of the P element */
  className?: string;
  /** The childrens of the P element */
  children: React.JSX.Element | string | string[] | Array<string | React.JSX.Element>;
}

const AP: FC<IAp> = ({ className, children }) => (
  <p
    className={classTrim(`
        ap
        ${className ?? ''}
      `)}
  >
    {children}
  </p>
);

export default AP;
