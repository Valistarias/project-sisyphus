import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ap.scss';

interface IAp extends IQuarkProps {
  /** The childrens of the P element */
  children?: ReactNode;
  /** When the text is left clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const AP: FC<IAp> = ({ className, children, onClick }) => (
  <Quark
    quarkType="p"
    onClick={onClick}
    className={classTrim(`
        ap
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default AP;
