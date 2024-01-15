import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aerror.scss';

interface IAerror extends IQuarkProps {
  /** The childrens of the P element */
  children: React.JSX.Element | string | string[];
}

const Aerror: FC<IAerror> = ({ className, children }) => (
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
