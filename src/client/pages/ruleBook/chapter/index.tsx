import React, {
  useEffect, useRef, useState, type FC
} from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  useApi, useSystemAlerts
} from '../../../providers';

import {
  Ap, Atitle
} from '../../../atoms';
import {
  Alert, RichTextElement
} from '../../../organisms';
import { ErrorPage } from '../../index';

import type { ICuratedChapter } from '../../../types';

import './chapter.scss';

const Chapter: FC = () => {
  const { t } = useTranslation();
  const {
    id: ruleBookId, chapterId
  } = useParams();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const calledApi = useRef<string | null>(null);

  const [chapter, setChapter] = useState<ICuratedChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (
      api !== undefined
      && ruleBookId !== undefined
      && chapterId !== undefined
      && calledApi.current !== chapterId
    ) {
      calledApi.current = chapterId;
      api.chapters
        .get({ chapterId })
        .then((chapter: ICuratedChapter) => {
          setLoading(false);
          if (chapter.chapter.ruleBook === undefined) {
            setNotFound(true);
          } else {
            setChapter(chapter ?? null);
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
  }, [
    api,
    createAlert,
    getNewId,
    ruleBookId,
    chapterId,
    t
  ]);

  if (loading) {
    return null;
  }

  if (notFound) {
    return <ErrorPage />;
  }

  return (
    <div className="chapter">
      <Atitle className="chapter__title" level={1}>
        {chapter?.chapter.title ?? ''}
      </Atitle>
      {chapter?.chapter.pages !== undefined
        ? chapter.chapter.pages.map(({
            _id, title, content
          }) => (
            <div key={_id} className="chapter__page">
              <Atitle className="chapter__page__title" level={2}>
                {title}
              </Atitle>
              <RichTextElement className="chapter__intro" rawStringContent={content} readOnly />
            </div>
          ))
        : null}
    </div>
  );
};

export default Chapter;
