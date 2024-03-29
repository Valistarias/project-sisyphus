import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ath.scss';

interface IAth extends IQuarkProps {
  /** The class of the Table Head Cell element */
  className?: string;
  /** The childrens of the Table Head Cell element */
  children: React.JSX.Element;
}

const ATh: FC<IAth> = ({ className, children }) => (
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
