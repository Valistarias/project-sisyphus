import React, {
  useEffect, useRef, useState, type FC
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

import './embedNotion.scss';

interface IEmbedNotion {
  /** The id for the notion called */
  notionId: string
}

const EmbedNotion: FC<IEmbedNotion> = ({ notionId }) => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
    editable: false
  });

  const calledApi = useRef(false);

  const [notionContent, setNotionContent] = useState<string>('');

  useEffect(() => {
    if (api !== undefined && notionId !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.notions
        .get({ notionId })
        .then(({ notion }) => {
          // TODO: Handle internationalization
          setNotionContent(notion.text);
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
    notionId,
    t
  ]);

  return <RichTextElement editor={textEditor} rawStringContent={notionContent} readOnly />;
};

export default EmbedNotion;
