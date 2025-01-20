import React, {
  useCallback, useMemo, useRef, useState, type FC, type ReactNode
} from 'react';

import { useEditor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';

import {
  useApi, useSystemAlerts
} from '../providers';

import { Ap } from '../atoms';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../organisms';

import type Entity from '../api/entities/entity';
import type { ErrorResponseType, INotion } from '../types';

import { classTrim } from '../utils';

import './highlight.scss';

interface IHighlight {
  /** The id of the selected element */
  id: string
  /** The type of element to highlight */
  type: string
  /** The children element to be displayed */
  children: ReactNode
}

const Highlight: FC<IHighlight> = ({
  id, type, children
}) => {
  const { api } = useApi();
  const { t } = useTranslation();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const [highlightContent, setHighlightContent]
  = useState<Record<string, unknown> | null>(null);
  const [isHighlightShown, setIsHighlightShown] = useState<boolean>(false);

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
    editable: false
  });

  const loading = useMemo(() => <Ap>Loading</Ap>, []);

  const contentHighlight = useMemo(() => {
    if (highlightContent === null) {
      return null;
    }
    if (type === 'notions') {
      return (highlightContent.notion as INotion).text;
    }

    return null;
  }, [highlightContent, type]);

  const sentOptions = useMemo(() => {
    if (type === 'notions') {
      return { notionId: id };
    }

    return null;
  }, [type, id]);

  const calledApi = useRef(false);

  const getData = useCallback(() => {
    if (api !== undefined && sentOptions !== null) {
      calledApi.current = true;
      (api[type] as Entity<unknown, unknown, unknown>)
        .get(sentOptions)
        .then((elt) => {
          setHighlightContent(elt as Record<string, unknown>);
        })
        .catch(({ response }: ErrorResponseType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [
    api,
    createAlert,
    getNewId,
    sentOptions,
    t,
    type
  ]);

  const onOpenHighlight = useCallback(() => {
    if (!calledApi.current) {
      getData();
    }
    setIsHighlightShown(true);
  }, [getData]);

  return (
    <span
      className={classTrim(`
        highlight
      `)}
      onMouseEnter={() => {
        onOpenHighlight();
      }}
      onMouseLeave={() => {
        setIsHighlightShown(false);
      }}
    >
      <span className="highlight__text">{children}</span>
      <span
        className="highlight__info"
        style={isHighlightShown
          ? {
              opacity: '1', pointerEvents: 'all'
            }
          : undefined}
      >
        {contentHighlight === null
          ? (
              loading
            )
          : (
              <RichTextElement
                editor={textEditor}
                rawStringContent={contentHighlight}
                readOnly
              />
            )}
      </span>
    </span>
  );
};

export default Highlight;
