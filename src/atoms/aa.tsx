import React, { type FC } from 'react';

import { Link } from 'react-router-dom';

import { classTrim } from '../utils';

import './aa.scss';

interface IAA {
  /** The class of the P element */
  className?: string;
  /** The link to another page */
  href: string;
  /** When the link is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** If the target is different to this page */
  target?: string;
  /** The childrens of the P element */
  children: React.JSX.Element | string | string[];
}

const AA: FC<IAA> = ({ className, children, href, target, onClick }) => (
  <Link
    to={href}
    target={target}
    onClick={onClick}
    className={classTrim(`
        aa
        ${className ?? ''}
      `)}
  >
    {children}
  </Link>
);

export default AA;
