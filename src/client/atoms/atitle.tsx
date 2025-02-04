import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './atitle.scss';

interface IAtitle {
  /** The class of the title */
  level?: 1 | 2 | 3 | 4;
  /** The childrens of the P element */
  children?: ReactNode;
}

const Atitle: FC<IQuarkProps<IAtitle>> = ({ className, children, level = 1 }) => (
  <Quark
    quarkType={`h${level}`}
    className={classTrim(`
        atitle
        atitle--h${level}
        ${className ?? ''}
      `)}
  >
    {children}
  </Quark>
);

export default Atitle;
