import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './aul.scss';

interface IAul {
  /** The class of the UL element */
  className?: string
  /** The childrens of the UL element */
  children: React.JSX.Element[] | null
}

const Aul: FC<IAul> = ({
  className,
  children
}) => (
  <ul
    className={
      classTrim(`
        aul
        ${className ?? ''}
      `)
    }
  >
    {children}
  </ul>
);

export default Aul;
