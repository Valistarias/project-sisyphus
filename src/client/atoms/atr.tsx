import React, {
  type FC, type ReactNode
} from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './atr.scss';

interface IAtr extends IQuarkProps {
  /** The childrens of the Table Row element */
  children: ReactNode
}

const ATr: FC<IAtr> = ({
  className, children
}) => (
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
