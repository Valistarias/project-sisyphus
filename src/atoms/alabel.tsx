import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './aa.scss';

interface IALabel {
  /** The class of the P element */
  className?: string
  /** Is the label connected to any field */
  htmlFor?: string
  /** The childrens of the P element */
  children: string
}

const ALabel: FC<IALabel> = ({
  className,
  children,
  htmlFor
}) => (
  <label
    htmlFor={htmlFor}
    className={
      classTrim(`
        alabel
        ${className ?? ''}
      `)
    }
  >
    {children}
  </label>
);

export default ALabel;
