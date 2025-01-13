import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './athead.scss';

interface IAthead extends IQuarkProps {
  /** The class of the Table Head element */
  className?: string
  /** The childrens of the Table Head element */
  children: ReactNode
}

const AThead: FC<IAthead> = ({ className, children }) => (
  <Quark
    quarkType="thead"
    className={classTrim(`
        athead
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default AThead;
