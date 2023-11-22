import React, { type FC, type ReactNode } from 'react';

import { classTrim } from '../utils';

import type { ContextId, DroppableId } from 'react-beautiful-dnd';


import './aul.scss';

interface IAul {
  /** The class of the UL element */
  className?: string;
  /** The childrens of the UL element */
  children: Array<React.JSX.Element | ReactNode> | null;
  /** Is the decoration to be removed ? */
  noPoints?: boolean;
  /** The innerRef, if there is any */
  innerRef?: (element: HTMLElement | null) => void;
  /** Used for Drag */
  'data-rbd-droppable-context-id'?: ContextId;
  'data-rbd-droppable-id'?: DroppableId;
}

const Aul: FC<IAul> = (props) => {
  const { className, children, noPoints = false, innerRef } = props;
  const rest = {
    'data-rbd-droppable-context-id': props['data-rbd-droppable-context-id'],
    'data-rbd-droppable-id': props['data-rbd-droppable-id'],
  };
  return (
    <ul
      className={classTrim(`
        aul
        ${className ?? ''}
        ${noPoints ? 'aul--nodecor' : ''}
      `)}
      ref={innerRef}
      {...rest}
    >
      {children}
    </ul>
  );
};

export default Aul;
