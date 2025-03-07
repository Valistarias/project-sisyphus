import React from 'react';
import type { FC, ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aa.scss';

interface IAA {
  /** The link to another page */
  href: string;
  /** When the link is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** If the target is different to this page */
  target?: string;
  /** The childrens of the P element */
  children: ReactNode;
}

const AA: FC<IQuarkProps<IAA>> = ({ className, children, href, target, onClick }) => (
  <Quark
    quarkType={Link}
    to={href}
    target={target}
    onClick={onClick}
    className={classTrim(`
        aa
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default AA;
