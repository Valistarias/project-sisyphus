import React, { useCallback, type FC, useEffect, useState, useRef, useMemo } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';
import { useConfirmMessage } from '../../providers/confirmMessage';

import { Aa, Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import {
  Alert,
  DragList,
  type IDragElt,
  RichTextElement,
  completeRichTextElementExtentions,
} from '../../organisms';

import type { ICuratedChapter, IPage } from '../../interfaces';

import { arraysEqual, formatDate } from '../../utils';

import './adminEditChapter.scss';

const AdminEditChapters: FC = () => {
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

  const [chapterName, setChapterName] = useState('');
  const [chapterNameFr, setChapterNameFr] = useState('');

  const [chapterSummary, setChapterSummary] = useState('');
  const [chapterSummaryFr, setChapterSummaryFr] = useState('');

  const [pagesData, setPagesData] = useState<IPage[] | null>(null);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [pagesOrder, setPagesOrder] = useState<string[]>([]);

  const [error, setError] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const pageDragData = useMemo(() => {
    if (pagesData === null || (pagesData.length === 0) === null) {
      return {};
    }

    const pages: Record<string, IDragElt> = {};
    pagesData.forEach((pageData) => {
      pages[pageData._id] = {
        id: pageData._id,
        title: pageData.title,
        button: {
          href: `/admin/page/${pageData._id}`,
          content: t('adminEditRuleBook.editChapter', { ns: 'pages' }),
        },
      };
    });

    return pages;
  }, [pagesData, t]);

  const onPageOrder = useCallback((elt: string[], isInitial: boolean) => {
    setPagesOrder(elt);
    if (isInitial) {
      setInitialOrder(elt);
    }
  }, []);

  const onSaveChapter = useCallback(
    (silent?: boolean) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
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
          .update({
            id,
            title: chapterName,
            summary: html,
            i18n,
          })
          .then(() => {
            if (silent === undefined) {
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{t('adminEditChapter.successUpdate', { ns: 'pages' })}</Ap>
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
    [id, introEditor, introFrEditor, api, chapterName, t, chapterNameFr, getNewId, createAlert]
  );

  const onUpdateOrder = useCallback(() => {
    if (arraysEqual(pagesOrder, initialOrder) || api === undefined || id === undefined) {
      return;
    }

    api.chapters
      .changePagesOrder({
        id,
        order: pagesOrder.map((page, index) => ({
          id: page,
          position: index,
        })),
      })
      .then(() => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditChapter.successUpdate', { ns: 'pages' })}</Ap>
            </Alert>
          ),
        });
        setInitialOrder(pagesOrder);
      })
      .catch(({ response }) => {
        const { data } = response;
        if (data.code === 'CYPU-104') {
          setError(
            t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
            })
          );
        } else {
          setError(
            t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
            })
          );
        }
      });
  }, [pagesOrder, initialOrder, api, id, getNewId, createAlert, t]);

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditChapter.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditChapter.confirmDeletion.text', { ns: 'pages', elt: chapterName }),
        confirmCta: t('adminEditChapter.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.chapters
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditChapter.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate(`/admin/rulebook/${ruleBookId}`);
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
          ConfMessageEvent.removeEventListener(evtId, confirmDelete);
        };
        ConfMessageEvent.addEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    setConfirmContent,
    t,
    chapterName,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    navigate,
    ruleBookId,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.chapters
        .get({ chapterId: id })
        .then(({ chapter, i18n }: ICuratedChapter) => {
          setChapterName(chapter.title);
          setChapterSummary(chapter.summary);
          setRuleBookId(chapter.ruleBook._id);
          setRuleBookName(chapter.ruleBook.title);
          setPagesData(chapter.pages ?? null);
          if (i18n.fr !== undefined) {
            setChapterNameFr(i18n.fr.title ?? '');
            setChapterSummaryFr(i18n.fr.summary ?? '');
          }
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

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      // onSaveChapter(true);
    }, 300000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [onSaveChapter]);

  return (
    <div className="adminEditChapter">
      <div className="adminEditChapter__head">
        <Atitle level={1}>{t('adminEditChapter.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskDelete} theme="error">
          {t('adminEditChapter.delete', { ns: 'pages' })}
        </Button>
      </div>
      <div className="adminEditChapter__ariane">
        <Ap className="adminEditChapter__ariane__elt">
          {`${t(`terms.ruleBook.ruleBook`)}: `}
          <Aa href={`/admin/rulebook/${ruleBookId}`}>{ruleBookName}</Aa>
        </Ap>
      </div>
      {autoSaved !== null ? <Ap className="adminEditChapter__autosave">{autoSaved}</Ap> : null}
      <div className="adminEditChapter__content">
        <div className="adminEditChapter__content__left">
          {error !== '' ? <Aerror className="adminEditChapter__error">{error}</Aerror> : null}
          <div className="adminEditChapter__basics">
            <Input
              type="text"
              label={t('nameChapter.label', { ns: 'fields' })}
              onChange={(e) => {
                setChapterName(e.target.value);
                setError('');
              }}
              value={chapterName}
              className="adminEditChapter__basics__name"
            />
          </div>
          <div className="adminEditChapter__details">
            <RichTextElement
              label={t('chapterSummary.title', { ns: 'fields' })}
              editor={introEditor}
              rawStringContent={chapterSummary}
              ruleBookId={ruleBookId}
              complete
              small
            />
          </div>

          <Atitle className="adminEditChapter__intl" level={2}>
            {t('adminEditChapter.i18n', { ns: 'pages' })}
          </Atitle>
          <Ap className="adminEditChapter__intl-info">
            {t('adminEditChapter.i18nInfo', { ns: 'pages' })}
          </Ap>
          <div className="adminEditChapter__basics">
            <Input
              type="text"
              label={`${t('nameChapter.label', { ns: 'fields' })} (FR)`}
              onChange={(e) => {
                setChapterNameFr(e.target.value);
              }}
              value={chapterNameFr}
              className="adminEditChapter__basics__name"
            />
          </div>
          <div className="adminEditChapter__details">
            <RichTextElement
              label={`${t('chapterSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={chapterSummaryFr}
              ruleBookId={ruleBookId}
              complete
              small
            />
          </div>
          <Button
            onClick={() => {
              onSaveChapter();
            }}
            disabled={error !== ''}
          >
            {t('adminEditChapter.button', { ns: 'pages' })}
          </Button>
        </div>
        <div className="adminEditChapter__content__right">
          <div className="adminEditChapter__block-children">
            <Atitle className="adminEditChapter__intl" level={2}>
              {t('adminEditChapter.pages', { ns: 'pages' })}
            </Atitle>
            <DragList data={pageDragData} id="main" onChange={onPageOrder} />
            <div className="adminEditRuleBook__block-children__buttons">
              {!arraysEqual(pagesOrder, initialOrder) ? (
                <Button onClick={onUpdateOrder}>
                  {t('adminEditRuleBook.updateOrder', { ns: 'pages' })}
                </Button>
              ) : null}
              <Button href={`/admin/page/new?chapterId=${id}&ruleBookId=${ruleBookId}`}>
                {t('adminEditChapter.createPage', { ns: 'pages' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditChapters;
