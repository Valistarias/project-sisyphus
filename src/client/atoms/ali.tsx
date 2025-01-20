import React from 'react';
import type {
  FC, ReactNode, RefObject
} from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './ali.scss';

interface IAli {
  /** The childrens of the LI element */
  children: ReactNode
  /** The innerRef, if there is any */
  innerRef?: RefObject<HTMLElement | null>
  role?: string
  tabIndex?: number
  draggable?: boolean
  onDragStart?: React.DragEventHandler<unknown>
  localStyle?: React.CSSProperties
}

const Ali: FC<IQuarkProps<IAli>> = (props) => {
  const {
    className, children, innerRef
  } = props;

  return (
    <Quark
      quarkType="li"
      className={classTrim(`
        ali
        ${className ?? ''}
      `)}
      reactProps={{ ref: innerRef }}
    >
      {children}
    </Quark>
  );
};

export default Ali;
