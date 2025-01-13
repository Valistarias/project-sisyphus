import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../../providers';

import { Aa, Ap, Atitle } from '../../../atoms';
import { Alert, RichTextElement } from '../../../organisms';
import { ErrorPage } from '../../index';

import type { ICuratedRuleBook } from '../../../types';

import './ruleBook.scss';

const RuleBook: FC = () => {
  const { t } = useTranslation();
  const { id: ruleBookId } = useParams();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef<string | null>(null);

  const [ruleBook, setRuleBook] = useState<ICuratedRuleBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // TODO: Handle Internationalization
  const contentList = useMemo(() => {
    if (ruleBook === null || ruleBookId === undefined) {
      return;
    }
    const { ruleBook: singleRuleBook } = ruleBook;

    return singleRuleBook.chapters.map(({ _id: chapterId, title: chapterTitle, pages }) => {
      const listPages = pages.map(({ _id: pageId, title: pageTitle }) => (
        <Aa key={pageId} href={`/rulebook/${ruleBookId}/${chapterId}#${pageId}`}>
          {pageTitle}
        </Aa>
      ));

      return (
        <div key={chapterId} className="rulebook__table-content__chapter">
          <Aa href={`/rulebook/${ruleBookId}/${chapterId}`}>{chapterTitle}</Aa>
          <div className="rulebook__table-content__chapter__pages">{listPages}</div>
        </div>
      );
    });
  }, [ruleBook, ruleBookId]);

  useEffect(() => {
    if (api !== undefined && ruleBookId !== undefined && calledApi.current !== ruleBookId) {
      setLoading(true);
      calledApi.current = ruleBookId;
      api.ruleBooks
        .get({ ruleBookId })
        .then((ruleBook: ICuratedRuleBook) => {
          setLoading(false);
          if (ruleBook.ruleBook === undefined) {
            setNotFound(true);
          } else {
            setRuleBook(ruleBook ?? null);
          }
        })
        .catch((res) => {
          setLoading(false);
          if (res.response.status === 404) {
            setNotFound(true);
          } else {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              )
            });
          }
        });
    }
  }, [api, createAlert, getNewId, ruleBookId, t]);

  if (loading) {
    return null;
  }

  if (notFound) {
    return <ErrorPage />;
  }

  return (
    <div className="rulebook">
      <Atitle className="rulebook__title" level={1}>
        {ruleBook?.ruleBook.title ?? ''}
      </Atitle>
      <RichTextElement
        className="chapter__intro"
        rawStringContent={ruleBook?.ruleBook.summary ?? undefined}
        readOnly
      />
      <div className="rulebook__table-content">
        <Atitle level={2}>{t('ruleBook.tableContent', { ns: 'pages' })}</Atitle>
        {contentList}
      </div>
    </div>
  );
};

export default RuleBook;
