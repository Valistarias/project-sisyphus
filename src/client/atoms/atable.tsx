import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './atable.scss';

interface IAtable extends IQuarkProps {
  /** The class of the Table element */
  className?: string;
  /** The childrens of the Table element */
  children: React.JSX.Element;
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
