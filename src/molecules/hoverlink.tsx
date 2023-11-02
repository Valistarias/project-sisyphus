import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './hoverlink.scss';

interface IHoverlink {
  /** The class of the P element */
  className?: string;
  /** The link to another page */
  href: string;
  /** The childrens of the P element */
  children: React.JSX.Element | string | string[];
}

const Hoverlink: FC<IHoverlink> = ({ className, children, href }) => (
  <p
    className={classTrim(`
        hoverlink
        ${className ?? ''}
      `)}
  >
    {children}
  </p>
);

export default Hoverlink;
