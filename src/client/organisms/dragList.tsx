import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode
} from 'react';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import invariant from 'tiny-invariant';

import { Ali, Atitle, Aul } from '../atoms';
import { Button } from '../molecules';

import { classTrim } from '../utils';

import './dragList.scss';

interface IDragElt {
  id: string
  title: string
  titleLevel?: 1 | 2 | 3 | 4
  button?: {
    href: string
    content: string
  }
}

interface IDragList {
  /** The class of the DragList */
  className?: string
  /** The data of the DragList */
  data: Record<string, IDragElt>
  /** The id of the DragList */
  id: string
  /** When the list changes of order */
  onChange: (elts: string[], isInitial: boolean) => void
}

interface IDragListCard {
  /** The index of the DragList */
  index: string
  /** The children inside the Drag List card */
  children: ReactNode
}

const DragListCard: FC<IDragListCard> = ({ children, index }) => {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const cardEl = cardRef.current;
    invariant(cardEl);

    return combine(
      draggable({
        element: cardEl,
        getInitialData: () => ({ type: 'card', cardId: index }),
        onDragStart: () => {
          setIsDragging(true);
        },
        onDrop: () => {
          setIsDragging(false);
        }
      }),
      dropTargetForElements({
        element: cardEl,
        getData: ({ input, element }) => {
          const data = { type: 'card', cardId: index };

          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['top', 'bottom']
          });
        },
        getIsSticky: () => true
      })
    );
  }, [index]);

  return (
    // attach a cardRef to the card div
    <Ali
      className={classTrim(`
      draglist__elt
      ${isDragging ? 'draglist__elt--dragging' : ''}
    `)}
      innerRef={cardRef}
    >
      {children}
    </Ali>
  );
};

const DragList: FC<IDragList> = ({ data, className, id, onChange }) => {
  const dragListRef = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [order, setOrder] = useState<string[]>([]);

  const reorderCard = useCallback(
    ({ movedIndex, destinationIndex }: { movedIndex: string, destinationIndex: string }) => {
      setOrder((prev: string[]) => {
        const movedPos = prev.findIndex(id => id === movedIndex);
        const destinationPos = prev.findIndex(id => id === destinationIndex);
        if (movedPos < 0 || destinationPos < 0) {
          return prev;
        }
        const next = [...prev];
        next.splice(movedPos, 1);
        next.splice(destinationPos, 0, movedIndex);
        onChange(next, false);

        return next;
      });
    },
    [onChange]
  );

  // Function to handle drop events
  const handleDrop = useCallback(
    ({ source, location }) => {
      const destination = location.current.dropTargets.length;
      if (destination === undefined) {
        return;
      }
      if (source.data.type === 'card') {
        const movedIndex = data[source.data.cardId].id;

        const [destination] = location.current.dropTargets;
        const destinationIndex = destination.data.cardId;

        if (movedIndex !== destinationIndex) {
          reorderCard({
            movedIndex,
            destinationIndex
          });
        }
      }
    },
    [data, reorderCard]
  );

  const listContent = useMemo(() => {
    const eltList = order.map(orderElt => data[orderElt]);

    return eltList.map((singleData: IDragElt) => (
      <DragListCard key={singleData.id} index={singleData.id}>
        <Atitle className="draglist__elt__title" level={singleData.titleLevel ?? 3}>
          {singleData.title}
        </Atitle>
        {singleData.button !== undefined
          ? (
              <Button size="small" href={singleData.button.href}>
                {singleData.button.content}
              </Button>
            )
          : null}
      </DragListCard>
    ));
  }, [data, order]);

  useEffect(() => {
    setOrder(Object.keys(data));
    onChange(Object.keys(data), true);
  }, [data, onChange]);

  useEffect(() => {
    const dragListEl = dragListRef.current;
    invariant(dragListEl);

    return dropTargetForElements({
      element: dragListEl,
      onDragStart: () => {
        setIsDraggedOver(true);
      },
      onDragEnter: () => {
        setIsDraggedOver(true);
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
      },
      onDrop: handleDrop,
      getIsSticky: () => true
    });
  }, [handleDrop]);

  return (
    <Aul
      className={classTrim(`
      draglist
        ${isDraggedOver ? 'draglist--dragged' : ''}
        ${className ?? ''}
      `)}
      innerRef={dragListRef}
      noPoints
    >
      {listContent}
    </Aul>
  );
};

export { DragList, type IDragElt };
