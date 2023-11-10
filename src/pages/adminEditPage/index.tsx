import React, { useCallback, type FC, useEffect, useState, useRef } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';
import { useConfirmMessage } from '../../providers/confirmMessage';

import { Aa, Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import type { ICuratedPage } from '../../interfaces';

import { formatDate } from '../../utils';

import './adminEditPage.scss';

const AdminEditPages: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage();
  const navigate = useNavigate();

  const calledApi = useRef(false);

  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const [autoSaved, setAutoSaved] = useState<string | null>(null);

  const [ruleBookId, setRuleBookId] = useState('');
  const [ruleBookName, setRuleBookName] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [chapterName, setChapterName] = useState('');

  const [pageName, setPageName] = useState('');
  const [pageNameFr, setPageNameFr] = useState('');

  const [pageContent, setPageContent] = useState('');
  const [pageContentFr, setPageContentFr] = useState('');

  const [error, setError] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const onSavePage = useCallback(
    (silent?: boolean) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      if (pageName === '') {
        setError(t('namePage.required', { ns: 'fields' }));
      } else {
        let html: string | null = introEditor.getHTML();
        const htmlFr = introFrEditor.getHTML();
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
          .update({
            id,
            title: pageName,
            content: html,
            i18n,
          })
          .then((rulebook) => {
            if (silent === undefined) {
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{t('adminEditPage.successUpdate', { ns: 'pages' })}</Ap>
                  </Alert>
                ),
              });
            } else {
              const date = formatDate(new Date(Date.now()));
              setAutoSaved(
                t('autosave', {
                  date: date.date,
                  hour: date.hour,
                  ns: 'components',
                })
              );
            }
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
    [id, introEditor, introFrEditor, api, pageName, t, pageNameFr, getNewId, createAlert]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditPage.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditPage.confirmDeletion.text', { ns: 'pages', elt: pageName }),
        confirmCta: t('adminEditPage.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.pages
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditPage.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate(`/admin/chapter/${chapterId}`);
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
          ConfMessageEvent.removeEventListener(evtId, confirmDelete);
        };
        ConfMessageEvent.addEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    setConfirmContent,
    t,
    pageName,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    navigate,
    chapterId,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.pages
        .get({ pageId: id })
        .then(({ page, i18n }: ICuratedPage) => {
          setPageName(page.title);
          setPageContent(page.content);
          setChapterId(page.chapter._id);
          setRuleBookId(page.chapter.ruleBook._id);
          setChapterName(page.chapter.title);
          setRuleBookName(page.chapter.ruleBook.title);
          if (i18n.fr !== undefined) {
            setPageNameFr(i18n.fr.title ?? '');
            setPageContentFr(i18n.fr.content ?? '');
          }
        })
        .catch(() => {
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

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      onSavePage(true);
    }, 300000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [onSavePage]);

  return (
    <div className="adminEditPage">
      <div className="adminEditPage__head">
        <Atitle level={1}>{t('adminEditPage.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskDelete} theme="error">
          {t('adminEditPage.delete', { ns: 'pages' })}
        </Button>
      </div>
      <div className="adminEditPage__ariane">
        <Ap className="adminEditPage__ariane__elt">
          {`${t(`terms.ruleBook.ruleBook`)}: `}
          <Aa href={`/admin/rulebook/${ruleBookId}`}>{ruleBookName}</Aa>
        </Ap>
        <Ap className="adminEditPage__ariane__elt">
          {`${t(`terms.ruleBook.chapter`)}: `}
          <Aa href={`/admin/chapter/${chapterId}`}>{chapterName}</Aa>
        </Ap>
      </div>
      {autoSaved !== null ? <Ap className="adminEditPage__autosave">{autoSaved}</Ap> : null}
      <div className="adminEditPage__content">
        <div className="adminEditPage__content__left">
          {error !== '' ? <Aerror className="adminEditPage__error">{error}</Aerror> : null}
          <div className="adminEditPage__basics">
            <Input
              type="text"
              label={t('namePage.label', { ns: 'fields' })}
              onChange={(e) => {
                setPageName(e.target.value);
                setError('');
              }}
              value={pageName}
              className="adminEditPage__basics__name"
            />
          </div>
          <div className="adminEditPage__details">
            <RichTextElement
              label={t('pageContent.title', { ns: 'fields' })}
              editor={introEditor}
              rawStringContent={pageContent}
              ruleBookId={ruleBookId}
              complete
              small
            />
          </div>

          <Atitle className="adminEditPage__intl" level={2}>
            {t('adminEditPage.i18n', { ns: 'pages' })}
          </Atitle>
          <Ap className="adminEditPage__intl-info">
            {t('adminEditPage.i18nInfo', { ns: 'pages' })}
          </Ap>
          <div className="adminEditPage__basics">
            <Input
              type="text"
              label={`${t('namePage.label', { ns: 'fields' })} (FR)`}
              onChange={(e) => {
                setPageNameFr(e.target.value);
              }}
              value={pageNameFr}
              className="adminEditPage__basics__name"
            />
          </div>
          <div className="adminEditPage__details">
            <RichTextElement
              label={`${t('pageContent.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={pageContentFr}
              ruleBookId={ruleBookId}
              complete
              small
            />
          </div>
          <Button
            onClick={() => {
              onSavePage();
            }}
            disabled={error !== ''}
          >
            {t('adminEditPage.button', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditPages;
