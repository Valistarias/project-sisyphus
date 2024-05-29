import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import type { ContextId, DroppableId } from 'react-beautiful-dnd';

import { classTrim } from '../utils';

import './aul.scss';

interface IAul extends IQuarkProps {
  /** The childrens of the UL element */
  children: ReactNode | null;
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
    <Quark
      quarkType="ul"
      className={classTrim(`
        aul
        ${className ?? ''}
        ${noPoints ? 'aul--nodecor' : ''}
      `)}
      reactProps={{
        ref: innerRef,
        ...rest,
      }}
    >
      {children}
    </Quark>
  );
};

export default Aul;
