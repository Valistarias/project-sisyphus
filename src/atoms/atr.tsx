import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './atr.scss';

interface IAtr extends IQuarkProps {
  /** The childrens of the Table Row element */
  children: React.JSX.Element;
}

const ATr: FC<IAtr> = ({ className, children }) => (
  <Quark
    quarkType="tr"
    className={classTrim(`
        atr
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default ATr;
