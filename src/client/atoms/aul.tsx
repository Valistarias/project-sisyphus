import React, { type RefObject, type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aul.scss';

interface IAul extends IQuarkProps {
  /** The childrens of the UL element */
  children: ReactNode | null
  /** Is the decoration to be removed ? */
  noPoints?: boolean
  /** The innerRef, if there is any */
  innerRef?: RefObject<null | ReactNode>
}

const Aul: FC<IAul> = (props) => {
  const { className, children, noPoints = false, innerRef } = props;

  return (
    <Quark
      quarkType="ul"
      className={classTrim(`
        aul
        ${className ?? ''}
        ${noPoints ? 'aul--nodecor' : ''}
      `)}
      reactProps={{
        ref: innerRef
      }}
    >
      {children}
    </Quark>
  );
};

export default Aul;
