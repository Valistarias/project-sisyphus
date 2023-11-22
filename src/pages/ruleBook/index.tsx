import React, { useEffect, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import type { ICuratedRuleBook } from '../../interfaces';

import './ruleBook.scss';

const RuleBook: FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef<string | null>(null);

  const [ruleBook, setRuleBook] = useState<ICuratedRuleBook | null>(null);

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  console.log('ruleBook', ruleBook);

  useEffect(() => {
    if (api !== undefined && id !== undefined && calledApi.current !== id) {
      calledApi.current = id;
      api.ruleBooks
        .get({ ruleBookId: id })
        .then((ruleBook: ICuratedRuleBook) => {
          setRuleBook(ruleBook);
        })
        .catch((res) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, id, t]);

  return (
    <div className="rulebook">
      <Atitle level={1}>{ruleBook?.ruleBook.title ?? ''}</Atitle>
      <RichTextElement
        editor={introEditor}
        className="rulebook__intro"
        rawStringContent={ruleBook?.ruleBook.summary ?? undefined}
        ruleBookId={id}
        complete
        readOnly
      />
    </div>
  );
};

export default RuleBook;
