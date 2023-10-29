import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './atr.scss';

interface IAtr {
  /** The class of the Table Row element */
  className?: string
  /** The childrens of the Table Row element */
  children: React.JSX.Element
}

const ATr: FC<IAtr> = ({
  className,
  children
}) => (
  <tr
    className={
      classTrim(`
        atr
        ${className ?? ''}
      `)
    }
  >
    {children}
  </tr>
);

export default ATr;
