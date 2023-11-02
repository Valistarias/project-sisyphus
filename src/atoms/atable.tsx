import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './atable.scss';

interface IAtable {
  /** The class of the Table element */
  className?: string;
  /** The childrens of the Table element */
  children: React.JSX.Element;
}

const ATable: FC<IAtable> = ({ className, children }) => (
  <table
    className={classTrim(`
        atable
        ${className ?? ''}
      `)}
  >
    {children}
  </table>
);

export default ATable;
