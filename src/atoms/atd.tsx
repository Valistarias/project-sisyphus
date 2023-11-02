import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './atd.scss';

interface IAtd {
  /** The class of the Table Cell element */
  className?: string;
  /** The childrens of the Table Cell element */
  children: React.JSX.Element;
}

const ATd: FC<IAtd> = ({ className, children }) => (
  <td
    className={classTrim(`
        atd
        ${className ?? ''}
      `)}
  >
    {children}
  </td>
);

export default ATd;
