import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './aul.scss';

interface IAul {
  /** The class of the UL element */
  className?: string
  /** The childrens of the UL element */
  children: React.JSX.Element[] | null
  /** Is the decoration to be removed ? */
  noPoints?: boolean
}

const Aul: FC<IAul> = ({
  className,
  children,
  noPoints = false
}) => (
  <ul
    className={
      classTrim(`
        aul
        ${className ?? ''}
        ${noPoints ? 'aul--nodecor' : ''}
      `)
    }
  >
    {children}
  </ul>
);

export default Aul;
