import React, { useCallback, type FC, useMemo, useState } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewChapter.scss';

const AdminNewChapters: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [chapterName, setChapterName] = useState('');
  const [chapterNameFr, setChapterNameFr] = useState('');

  const [chapterSummary] = useState('');
  const [chapterSummaryFr] = useState('');

  const [error, setError] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const onSaveChapter = useCallback(
    (elt) => {
      if (
        introEditor === null ||
        introFrEditor === null ||
        api === undefined ||
        params.get('ruleBookId') === undefined ||
        params.get('type') === undefined
      ) {
        return;
      }
      if (chapterName === '') {
        setError(t('nameChapter.required', { ns: 'fields' }));
      } else {
        let html: string | null = introEditor.getHTML();
        const htmlFr = introFrEditor.getHTML();
        if (html === '<p class="ap"></p>') {
          html = null;
        }

        let i18n: any | null = null;

        if (chapterNameFr !== '' || htmlFr !== '<p class="ap"></p>') {
          i18n = {
            fr: {
              title: chapterNameFr,
              summary: htmlFr,
            },
          };
        }

        api.chapters
          .create({
            title: chapterName,
            type: params.get('type'),
            ruleBook: params.get('ruleBookId'),
            summary: html,
            i18n,
          })
          .then((chapter) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminNewChapter.successCreate', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            navigate(`/admin/chapter/${chapter._id}`);
          })
          .catch(({ response }) => {
            const { data } = response;
            if (data.code === 'CYPU-104') {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize'),
                })
              );
            } else {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize'),
                })
              );
            }
          });
      }
    },
    [
      introEditor,
      introFrEditor,
      api,
      params,
      chapterName,
      t,
      chapterNameFr,
      getNewId,
      createAlert,
      navigate,
    ]
  );

  return (
    <div className="adminNewChapter">
      <Atitle level={1}>{t('adminNewChapter.title', { ns: 'pages' })}</Atitle>
      {error !== '' ? <Aerror className="adminNewChapter__error">{error}</Aerror> : null}
      <div className="adminNewChapter__basics">
        <Input
          type="text"
          label={t('nameChapter.label', { ns: 'fields' })}
          onChange={(e) => {
            setChapterName(e.target.value);
            setError('');
          }}
          value={chapterName}
          className="adminNewChapter__basics__name"
        />
      </div>
      <div className="adminNewChapter__details">
        <RichTextElement
          label={t('chapterSummary.title', { ns: 'fields' })}
          editor={introEditor}
          rawStringContent={chapterSummary}
          small
          complete
        />
      </div>

      <Atitle className="adminNewChapter__intl" level={2}>
        {t('adminNewChapter.i18n', { ns: 'pages' })}
      </Atitle>
      <Ap className="adminNewChapter__intl-info">
        {t('adminNewChapter.i18nInfo', { ns: 'pages' })}
      </Ap>
      <div className="adminNewChapter__basics">
        <Input
          type="text"
          label={`${t('nameChapter.label', { ns: 'fields' })} (FR)`}
          onChange={(e) => {
            setChapterNameFr(e.target.value);
          }}
          value={chapterNameFr}
          className="adminNewChapter__basics__name"
        />
      </div>
      <div className="adminNewChapter__details">
        <RichTextElement
          label={`${t('chapterSummary.title', { ns: 'fields' })} (FR)`}
          editor={introFrEditor}
          rawStringContent={chapterSummaryFr}
          small
          complete
        />
      </div>
      <Button onClick={onSaveChapter} disabled={error !== ''}>
        {t('adminNewChapter.button', { ns: 'pages' })}
      </Button>
    </div>
  );
};

export default AdminNewChapters;
