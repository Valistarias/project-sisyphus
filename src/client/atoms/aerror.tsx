import React, {
  type FC, type ReactNode
} from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './aerror.scss';

interface IAerror {
  /** The childrens of the P element */
  children: ReactNode
}

const Aerror: FC<IQuarkProps<IAerror>> = ({
  className, children
}) => (
  <Quark
    quarkType="p"
    className={classTrim(`
        aerror
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default Aerror;
