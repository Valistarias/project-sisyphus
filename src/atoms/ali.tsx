import React, { type FC } from 'react';

import { classTrim } from '../utils';

import type {
  ContextId,
  DraggableId,
  DraggingStyle,
  ElementId,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import './ali.scss';

interface IAli {
  /** The class of the LI element */
  className?: string;
  /** The childrens of the LI element */
  children: React.JSX.Element | React.JSX.Element[] | Array<React.JSX.Element | null>;
  /** The innerRef, if there is any */
  innerRef?: (element: HTMLElement | null) => void;
  /** Used for Drag */
  style?: DraggingStyle | NotDraggingStyle | undefined;
  'data-rbd-draggable-context-id'?: string;
  'data-rbd-draggable-id'?: string;
  onTransitionEnd?: React.TransitionEventHandler<any> | undefined;
  /** Used for DragHandle */
  'data-rbd-drag-handle-draggable-id'?: DraggableId;
  'data-rbd-drag-handle-context-id'?: ContextId;
  'aria-describedby'?: ElementId;
  role?: string;
  tabIndex?: number;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<any>;
}

const Ali: FC<IAli> = (props) => {
  const { className, children, innerRef } = props;
  const restDrag = {
    style: props.style,
    'data-rbd-draggable-context-id': props['data-rbd-draggable-context-id'],
    'data-rbd-draggable-id': props['data-rbd-draggable-id'],
    onTransitionEnd: props.onTransitionEnd,
  };

  const restHandle = {
    'data-rbd-drag-handle-draggable-id': props['data-rbd-drag-handle-draggable-id'],
    'data-rbd-drag-handle-context-id': props['data-rbd-drag-handle-context-id'],
    'aria-describedby': props['aria-describedby'],
    role: props.role,
    tabIndex: props.tabIndex,
    draggable: props.draggable,
    onDragStart: props.onDragStart,
  };

  return (
    <li
      className={classTrim(`
        ali
        ${className ?? ''}
      `)}
      ref={innerRef}
      {...restDrag}
      {...restHandle}
    >
      {children}
    </li>
  );
};

export default Ali;
