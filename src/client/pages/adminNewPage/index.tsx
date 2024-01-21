import React, { useCallback, useMemo, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewPage.scss';

const AdminNewPage: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [pageName, setPageName] = useState('');
  const [pageNameFr, setPageNameFr] = useState('');

  const [pageContent] = useState('');
  const [pageContentFr] = useState('');

  const [error, setError] = useState('');

  const contentEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const contentFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const onSavePage = useCallback(
    (elt) => {
      if (
        contentEditor === null ||
        contentFrEditor === null ||
        api === undefined ||
        params.get('ruleBookId') === undefined ||
        params.get('chapterId') === undefined
      ) {
        return;
      }
      if (pageName === '') {
        setError(t('namePage.required', { ns: 'fields' }));
      } else {
        let html: string | null = contentEditor.getHTML();
        const htmlFr = contentFrEditor.getHTML();
        if (html === '<p class="ap"></p>') {
          html = null;
        }

        let i18n: any | null = null;

        if (pageNameFr !== '' || htmlFr !== '<p class="ap"></p>') {
          i18n = {
            fr: {
              title: pageNameFr,
              content: htmlFr,
            },
          };
        }

        api.pages
          .create({
            title: pageName,
            chapter: params.get('chapterId'),
            content: html,
            i18n,
          })
          .then((page) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminNewPage.successCreate', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            navigate(`/admin/page/${page._id}`);
          })
          .catch(({ response }) => {
            const { data } = response;
            if (data.code === 'CYPU-104') {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize'),
                })
              );
            } else {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize'),
                })
              );
            }
          });
      }
    },
    [
      contentEditor,
      contentFrEditor,
      api,
      params,
      pageName,
      t,
      pageNameFr,
      getNewId,
      createAlert,
      navigate,
    ]
  );

  return (
    <div className="adminNewPage">
      <div className="adminNewPage__content">
        <Atitle level={1}>{t('adminNewPage.title', { ns: 'pages' })}</Atitle>
        {error !== '' ? <Aerror className="adminNewPage__error">{error}</Aerror> : null}
        <div className="adminNewPage__basics">
          <Input
            type="text"
            label={t('namePage.label', { ns: 'fields' })}
            onChange={(e) => {
              setPageName(e.target.value);
              setError('');
            }}
            value={pageName}
            className="adminNewPage__basics__name"
          />
        </div>
        <div className="adminNewPage__details">
          <RichTextElement
            label={t('pageContent.title', { ns: 'fields' })}
            editor={contentEditor}
            rawStringContent={pageContent}
            ruleBookId={params.get('ruleBookId') ?? undefined}
            complete
          />
        </div>

        <Atitle className="adminNewPage__intl" level={2}>
          {t('adminNewPage.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewPage__intl-info">{t('adminNewPage.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminNewPage__basics">
          <Input
            type="text"
            label={`${t('namePage.label', { ns: 'fields' })} (FR)`}
            onChange={(e) => {
              setPageNameFr(e.target.value);
            }}
            value={pageNameFr}
            className="adminNewPage__basics__name"
          />
        </div>
        <div className="adminNewPage__details">
          <RichTextElement
            label={`${t('pageContent.title', { ns: 'fields' })} (FR)`}
            editor={contentFrEditor}
            rawStringContent={pageContentFr}
            ruleBookId={params.get('ruleBookId') ?? undefined}
            complete
          />
        </div>
        <Button onClick={onSavePage} disabled={error !== ''}>
          {t('adminNewPage.button', { ns: 'pages' })}
        </Button>
      </div>
    </div>
  );
};

export default AdminNewPage;
