import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ath.scss';

interface IAth {
  /** The childrens of the Table Head Cell element */
  children: ReactNode;
}

const ATh: FC<IQuarkProps<IAth>> = ({ className, children }) => (
  <Quark
    quarkType="th"
    className={classTrim(`
        ath
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default ATh;
