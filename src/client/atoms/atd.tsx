import React, {
  type FC, type ReactNode
} from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './atd.scss';

interface IAtd extends IQuarkProps {
  /** The childrens of the Table Cell element */
  children: ReactNode
}

const ATd: FC<IAtd> = ({
  className, children
}) => (
  <Quark
    quarkType="td"
    className={classTrim(`
        atd
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default ATd;
