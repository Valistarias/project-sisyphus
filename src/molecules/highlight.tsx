import React, { useState, useEffect, useRef, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useApi } from '../providers/api';
import { useSystemAlerts } from '../providers/systemAlerts';
import { useEditor } from '@tiptap/react';

import { Ap } from '../atoms';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../organisms';

import './highlight.scss';

interface IHighlight {
  /** The id of the selected element */
  id: string;
  /** The type of element to highlight */
  type: string;
  /** The children element to be displayed */
  children: React.JSX.Element | string;
}

const Highlight: FC<IHighlight> = ({ id, type, children }) => {
  console.log('id', id);
  console.log('type', type);
  console.log('children', children);
  // const { t } = useTranslation();
  // const { api } = useApi();
  // const { createAlert, getNewId } = useSystemAlerts();

  // const textEditor = useEditor({
  //   extensions: completeRichTextElementExtentions,
  //   editable: false,
  // });

  // const calledApi = useRef(false);

  // const [notionContent, setNotionContent] = useState<string>('');

  // useEffect(() => {
  //   if (api !== undefined && notionId !== undefined) {
  //     calledApi.current = true;
  //     api.notions
  //       .get({ notionId })
  //       .then(({ notion }) => {
  //         // TODO: Do internationalization
  //         setNotionContent(notion.text);
  //       })
  //       .catch((res) => {
  //         const newId = getNewId();
  //         createAlert({
  //           key: newId,
  //           dom: (
  //             <Alert key={newId} id={newId} timer={5}>
  //               <Ap>{t('serverErrors.CYPU-301')}</Ap>
  //             </Alert>
  //           ),
  //         });
  //       });
  //   }
  // }, [api, createAlert, getNewId, notionId, t]);

  return <span className="highlight">{children}</span>;
};

export default Highlight;
