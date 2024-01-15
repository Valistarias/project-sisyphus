import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './alabel.scss';

interface IALabel extends IQuarkProps {
  /** Is the label connected to any field */
  htmlFor?: string;
  /** The childrens of the P element */
  children: string;
}

const ALabel: FC<IALabel> = ({ className, children, htmlFor }) => (
  <Quark
    quarkType="label"
    htmlFor={htmlFor}
    className={classTrim(`
        alabel
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default ALabel;
