import React, { useCallback, useEffect, useMemo, useState, type FC } from 'react';

import { DragDropContext, Draggable, Droppable, type DropResult } from 'react-beautiful-dnd';

import { Ali, Atitle, Aul } from '../atoms';
import { Button } from '../molecules';

import { classTrim } from '../utils';

import './dragList.scss';

interface IDragElt {
  id: string;
  title: string;
  button?: {
    href: string;
    content: string;
  };
}

interface IDragList {
  /** The class of the DragList */
  className?: string;
  /** The data of the DragList */
  data: Record<string, IDragElt>;
  /** The id of the DragList */
  id: string;
  /** When the list changes of order */
  onChange: (elts: string[], isInitial: boolean) => void;
}

const DragList: FC<IDragList> = ({ data, className, id, onChange }) => {
  const [order, setOrder] = useState<string[]>([]);

  const onDragEnd = useCallback(
    ({ destination, source, draggableId }: DropResult) => {
      if (destination === null || destination === undefined) {
        return;
      }
      // If destination hasnt changed
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      setOrder((prev: string[]) => {
        const next = [...prev];
        next.splice(source.index, 1);
        next.splice(destination.index, 0, draggableId);
        onChange(next, false);
        return next;
      });
    },
    [onChange]
  );

  const listContent = useMemo(() => {
    const eltList = order.map((orderElt) => data[orderElt]);
    return eltList.map((singleData: IDragElt, index) => (
      <Draggable draggableId={singleData.id} index={index} key={singleData.id}>
        {(providedDraggable) => (
          <Ali
            className="draglist__elt"
            innerRef={providedDraggable.innerRef}
            {...providedDraggable.draggableProps}
            {...providedDraggable.dragHandleProps}
          >
            <Atitle className="draglist__elt__title" level={4}>
              {singleData.title}
            </Atitle>
            {singleData.button !== undefined ? (
              <Button size="small" href={singleData.button.href}>
                {singleData.button.content}
              </Button>
            ) : null}
          </Ali>
        )}
      </Draggable>
    ));
  }, [data, order]);

  useEffect(() => {
    setOrder(Object.keys(data));
    onChange(Object.keys(data), true);
  }, [data, onChange]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={id}>
        {(providedDroppable) => (
          <Aul
            className={classTrim(`
              draglist
                ${className ?? ''}
              `)}
            innerRef={providedDroppable.innerRef}
            {...providedDroppable.droppableProps}
            noPoints
          >
            {listContent}
            {providedDroppable.placeholder}
          </Aul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export { DragList, type IDragElt };
