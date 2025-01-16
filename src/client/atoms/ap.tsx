import React from 'react';
import type {
  FC, ReactNode
} from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './ap.scss';

interface IAp {
  /** The title, when the mouse over */
  title?: string
  /** The childrens of the P element */
  children?: ReactNode
  /** The lang param, if defined */
  lang?: string
  /** Is the hyphens activated */
  hyphens?: boolean
  /** When the text is left clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const AP: FC<IQuarkProps<IAp>> = ({
  className, title, children, lang, hyphens = false, onClick
}) => (
  <Quark
    quarkType="p"
    reactProps={{ ...(lang !== undefined ? { lang } : {}) }}
    onClick={onClick}
    title={title}
    className={classTrim(`
        ap
        ${hyphens ? 'ap--hyphens' : ''}
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default AP;
