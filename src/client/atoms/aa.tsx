import React, { type FC } from 'react';

import { Link } from 'react-router-dom';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aa.scss';

interface IAA extends IQuarkProps {
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
