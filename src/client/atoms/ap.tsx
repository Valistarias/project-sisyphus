import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ap.scss';

interface IAp extends IQuarkProps {
  /** The childrens of the P element */
  children?: React.JSX.Element | string | string[] | Array<string | React.JSX.Element>;
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
