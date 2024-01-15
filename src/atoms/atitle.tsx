import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './atitle.scss';

interface IAtitle extends IQuarkProps {
  /** The class of the title */
  level?: 1 | 2 | 3 | 4;
  /** The childrens of the P element */
  children?: React.JSX.Element | string | string[];
}

const Atitle: FC<IAtitle> = ({ className, children, level = 1 }) => (
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
