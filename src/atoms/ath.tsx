import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './ath.scss';

interface IAth {
  /** The class of the Table Head Cell element */
  className?: string
  /** The childrens of the Table Head Cell element */
  children: React.JSX.Element
}

const ATh: FC<IAth> = ({
  className,
  children
}) => (
  <th
    className={
      classTrim(`
        ath
        ${className ?? ''}
      `)
    }
  >
    {children}
  </th>
);

export default ATh;
