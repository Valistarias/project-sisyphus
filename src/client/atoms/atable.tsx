import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './atable.scss';

interface IAtable {
  /** The childrens of the Table element */
  children: ReactNode;
}

const ATable: FC<IQuarkProps<IAtable>> = ({ className, children }) => (
  <Quark
    quarkType="table"
    className={classTrim(`
        atable
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default ATable;
