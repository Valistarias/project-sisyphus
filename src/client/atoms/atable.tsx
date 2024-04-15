import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './atable.scss';

interface IAtable extends IQuarkProps {
  /** The childrens of the Table element */
  children: ReactNode;
}

const ATable: FC<IAtable> = ({ className, children }) => (
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
