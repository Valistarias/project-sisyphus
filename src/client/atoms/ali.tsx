import type React from 'react';
import type { FC, ReactNode, RefObject } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ali.scss';

interface IAli extends IQuarkProps {
  /** The childrens of the LI element */
  children: ReactNode;
  /** The innerRef, if there is any */
  innerRef?: RefObject<null | ReactNode>;
  role?: string;
  tabIndex?: number;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<any>;
  localStyle?: React.CSSProperties;
}

const Ali: FC<IAli> = (props) => {
  const { className, children, innerRef } = props;

  return (
    <Quark
      quarkType="li"
      className={classTrim(`
        ali
        ${className ?? ''}
      `)}
      reactProps={{
        ref: innerRef,
      }}
    >
      {children}
    </Quark>
  );
};

export default Ali;
