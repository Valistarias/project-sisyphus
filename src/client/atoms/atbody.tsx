import React, {
  type FC, type ReactNode
} from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './atbody.scss';

interface IAtbody {
  /** The class of the Table Head element */
  className?: string
  /** The childrens of the Table Head element */
  children: ReactNode
}

const ATbody: FC<IQuarkProps<IAtbody>> = ({
  className, children
}) => (
  <Quark
    quarkType="tbody"
    className={classTrim(`
        atbody
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default ATbody;
