import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ap.scss';

interface IAp extends IQuarkProps {
  /** The childrens of the P element */
  children?: React.JSX.Element | string | string[] | Array<string | React.JSX.Element>;
}

const AP: FC<IAp> = ({ className, children }) => (
  <Quark
    quarkType="p"
    className={classTrim(`
        ap
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default AP;
