import React, {
  type RefObject, type FC, type ReactNode
} from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './aul.scss';

interface IAul {
  /** The childrens of the UL element */
  children: ReactNode | null
  /** Is the decoration to be removed ? */
  noPoints?: boolean
  /** The innerRef, if there is any */
  innerRef?: RefObject<HTMLElement | null>
}

const Aul: FC<IQuarkProps<IAul>> = (props) => {
  const {
    className, children, noPoints = false, innerRef
  } = props;

  return (
    <Quark
      quarkType="ul"
      className={classTrim(`
        aul
        ${className ?? ''}
        ${noPoints ? 'aul--nodecor' : ''}
      `)}
      reactProps={{ ref: innerRef }}
    >
      {children}
    </Quark>
  );
};

export default Aul;
