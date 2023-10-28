import React, { type FC } from 'react';

import { Link } from 'react-router-dom';

import { classTrim } from '../utils';

import './aa.scss';

interface IAA {
  /** The class of the P element */
  className?: string
  /** The link to another page */
  href: string
  /** If the target is different to this page */
  target?: string
  /** The childrens of the P element */
  children: React.JSX.Element | string | string[]
}

const AA: FC<IAA> = ({
  className,
  children,
  href,
  target
}) => (
  <Link
    to={href}
    target={target}
    className={
      classTrim(`
        aa
        ${className ?? ''}
      `)
    }
  >
    {children}
  </Link>
);

export default AA;
