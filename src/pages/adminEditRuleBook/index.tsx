import React, { useCallback, type FC, useEffect, useState, useRef, useMemo } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';
import { useConfirmMessage } from '../../providers/confirmMessage';

import { Aerror, Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button, Input } from '../../molecules';
import {
  Alert,
  type ISingleValueSelect,
  RichTextElement,
  SmartSelect,
  completeRichTextElementExtentions,
  DragList,
  type IDragElt,
} from '../../organisms';

import type {
  INotion,
  ICuratedRuleBook,
  IRuleBookType,
  IChapterType,
  IChapter,
} from '../../interfaces';

import { arraysEqual, formatDate } from '../../utils';

import './adminEditRuleBook.scss';

const AdminEditRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage();
  const navigate = useNavigate();

  const calledApi = useRef(false);

  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const [autoSaved, setAutoSaved] = useState<string | null>(null);

  const [ruleBookName, setRuleBookName] = useState('');
  const [ruleBookNameFr, setRuleBookNameFr] = useState('');

  const [ruleBookSummary, setRuleBookSummary] = useState('');
  const [ruleBookSummaryFr, setRuleBookSummaryFr] = useState('');

  const [archived, setArchived] = useState<boolean>(false);

  const [sentDraft, setSentDraft] = useState<boolean | null>(null);
  const [draftChoices] = useState([
    {
      value: 'draft',
      label: i18next.format(t('terms.ruleBook.draft'), 'capitalize'),
    },
    {
      value: 'published',
      label: i18next.format(t('terms.ruleBook.published'), 'capitalize'),
    },
  ]);

  const [ruleBookTypes, setRuleBookTypes] = useState<ISingleValueSelect[]>([]);
  const [sentApiType, setSentApiType] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [notionsData, setNotionsData] = useState<INotion[] | null>(null);

  const [chaptersData, setChaptersData] = useState<IChapter[] | null>(null);
  const [defaultTypeChapterId, setDefaultTypeChapterId] = useState<string | null>(null);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [chaptersOrder, setChaptersOrder] = useState<string[]>([]);

  const [error, setError] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const notionsListDom = useMemo(() => {
    if (notionsData === null || (notionsData.length === 0) === null) {
      return null;
    }
    return (
      <Aul className="adminEditRuleBook__notion-list" noPoints>
        {notionsData.map((notion) => (
          <Ali className="adminEditRuleBook__notion-list__elt" key={notion._id}>
            <Atitle level={4}>{notion.title}</Atitle>
            <Button size="small" href={`/admin/notion/${notion._id}`}>
              {t('adminEditRuleBook.editNotion', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [notionsData, t]);

  const chapterDragData = useMemo(() => {
    if (chaptersData === null || (chaptersData.length === 0) === null) {
      return {};
    }

    const chapters: Record<string, IDragElt> = {};
    chaptersData.forEach((chapterData) => {
      chapters[chapterData._id] = {
        id: chapterData._id,
        title: chapterData.title,
        button: {
          href: `/admin/chapter/${chapterData._id}`,
          content: t('adminEditRuleBook.editChapter', { ns: 'pages' }),
        },
      };
    });

    return chapters;
  }, [chaptersData, t]);

  const sentApiTypeChoice = useMemo(() => {
    if (sentApiType === null || ruleBookTypes.length === 0) {
      return null;
    }
    const selectedfield = ruleBookTypes.find((ruleBookType) => ruleBookType.value === sentApiType);
    if (selectedfield !== undefined) {
      return selectedfield;
    }
    return null;
  }, [sentApiType, ruleBookTypes]);

  const sentDraftChoice = useMemo(() => {
    if (sentDraft === null) {
      return null;
    }
    const selectedfield = draftChoices.find((draftChoice) => {
      if (sentDraft) {
        return draftChoice.value === 'draft';
      }
      return draftChoice.value === 'published';
    });
    if (selectedfield !== undefined) {
      return selectedfield;
    }
    return null;
  }, [sentDraft, draftChoices]);

  const onChapterOrder = useCallback((elt: string[], isInitial: boolean) => {
    setChaptersOrder(elt);
    if (isInitial) {
      setInitialOrder(elt);
    }
  }, []);

  const onChangeDraftState = useCallback(
    (draftState: string) => {
      if (api === undefined || id === undefined) {
        return;
      }
      setSentDraft(draftState === 'draft');
      api.ruleBooks
        .publish({
          id,
          draft: draftState === 'draft',
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
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
    },
    [id, api, t, getNewId, createAlert]
  );

  const onSaveRuleBook = useCallback(
    (silent?: boolean) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      if (ruleBookName === '') {
        setError(t('nameRuleBook.required', { ns: 'fields' }));
      } else if (selectedType === null) {
        setError(t('typeRuleBook.required', { ns: 'fields' }));
      } else {
        let html: string | null = introEditor.getHTML();
        const htmlFr = introFrEditor.getHTML();
        if (html === '<p class="ap"></p>') {
          html = null;
        }

        let i18n: any | null = null;

        if (ruleBookNameFr !== '' || htmlFr !== '<p class="ap"></p>') {
          i18n = {
            fr: {
              title: ruleBookNameFr,
              summary: htmlFr,
            },
          };
        }

        api.ruleBooks
          .update({
            id,
            title: ruleBookName,
            type: selectedType,
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
                    <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
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
      }
    },
    [
      id,
      introEditor,
      introFrEditor,
      api,
      ruleBookName,
      selectedType,
      t,
      ruleBookNameFr,
      getNewId,
      createAlert,
    ]
  );

  const onUpdateOrder = useCallback(() => {
    if (arraysEqual(chaptersOrder, initialOrder) || api === undefined || id === undefined) {
      return;
    }

    api.ruleBooks
      .changeChaptersOrder({
        id,
        order: chaptersOrder.map((chapter, index) => ({
          id: chapter,
          position: index,
        })),
      })
      .then(() => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
            </Alert>
          ),
        });
        setInitialOrder(chaptersOrder);
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
  }, [chaptersOrder, initialOrder, api, id, getNewId, createAlert, t]);

  const onAskArchive = useCallback(() => {
    if (api === undefined || id === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t(
          archived
            ? 'adminEditRuleBook.confirmUnarchive.title'
            : 'adminEditRuleBook.confirmArchive.title',
          { ns: 'pages' }
        ),
        text: t(
          archived
            ? 'adminEditRuleBook.confirmUnarchive.text'
            : 'adminEditRuleBook.confirmArchive.text',
          { ns: 'pages', elt: ruleBookName }
        ),
        confirmCta: t(
          archived
            ? 'adminEditRuleBook.confirmUnarchive.confirmCta'
            : 'adminEditRuleBook.confirmArchive.confirmCta',
          { ns: 'pages' }
        ),
      },
      (evtId: string) => {
        const confirmArchive = ({ detail }): void => {
          if (detail.proceed === true) {
            api.ruleBooks
              .archive({ id, archived: !archived })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>
                        {t(
                          archived
                            ? 'adminEditRuleBook.successUnarchive'
                            : 'adminEditRuleBook.successArchive',
                          { ns: 'pages' }
                        )}
                      </Ap>
                    </Alert>
                  ),
                });
                navigate('/admin/rulebooks');
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
          }
          ConfMessageEvent.removeEventListener(evtId, confirmArchive);
        };
        ConfMessageEvent.addEventListener(evtId, confirmArchive);
      }
    );
  }, [
    api,
    setConfirmContent,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    t,
    navigate,
    ruleBookName,
    archived,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.ruleBooks
        .get({ ruleBookId: id })
        .then(({ ruleBook, i18n }: ICuratedRuleBook) => {
          setRuleBookName(ruleBook.title);
          setRuleBookSummary(ruleBook.summary);
          setSentApiType(ruleBook.type._id);
          setSelectedType(ruleBook.type._id);
          setNotionsData(ruleBook.notions);
          setChaptersData(ruleBook.chapters);
          setArchived(ruleBook.archived);
          setSentDraft(ruleBook.draft);
          if (i18n.fr !== undefined) {
            setRuleBookNameFr(i18n.fr.title ?? '');
            setRuleBookSummaryFr(i18n.fr.summary ?? '');
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
      api.ruleBookTypes
        .getAll()
        .then((data: IRuleBookType[]) => {
          setRuleBookTypes(
            data.map((ruleBookType) => ({
              value: ruleBookType._id,
              label: t(`ruleBookTypeNames.${ruleBookType.name}`, { count: 1 }),
              details: ruleBookType.name,
            }))
          );
        })
        .catch(({ response }) => {
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
      api.chapterTypes
        .getAll()
        .then((data: IChapterType[]) => {
          setDefaultTypeChapterId(
            data.find((chapterType) => chapterType.name === 'default')?._id ?? null
          );
        })
        .catch(({ response }) => {
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
  }, [api, createAlert, getNewId, ruleBookTypes, id, t]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      onSaveRuleBook(true);
    }, 300000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [onSaveRuleBook]);

  return (
    <div className="adminEditRuleBook">
      <div className="adminEditRuleBook__head">
        <Atitle level={1}>{t('adminEditRuleBook.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskArchive} theme={archived ? 'tertiary' : 'error'}>
          {t(archived ? 'adminEditRuleBook.unarchive' : 'adminEditRuleBook.archive', {
            ns: 'pages',
          })}
        </Button>
      </div>
      {autoSaved !== null ? <Ap className="adminEditRuleBook__autosave">{autoSaved}</Ap> : null}
      <div className="adminEditRuleBook__content">
        <div className="adminEditRuleBook__content__left">
          {error !== '' ? <Aerror className="adminEditRuleBook__error">{error}</Aerror> : null}
          <div className="adminEditRuleBook__basics">
            <Input
              type="text"
              label={t('nameRuleBook.label', { ns: 'fields' })}
              onChange={(e) => {
                setRuleBookName(e.target.value);
                setError('');
              }}
              value={ruleBookName}
              className="adminEditRuleBook__basics__name"
            />
            <SmartSelect
              label={t('typeRuleBook.select', { ns: 'fields' })}
              options={ruleBookTypes}
              selected={sentApiTypeChoice}
              onChange={(choice) => {
                setSelectedType(choice.value);
                setError('');
              }}
              className="adminEditRuleBook__basics__type"
            />
          </div>
          <div className="adminEditRuleBook__details">
            <RichTextElement
              label={t('ruleBookSummary.title', { ns: 'fields' })}
              editor={introEditor}
              rawStringContent={ruleBookSummary}
              ruleBookId={id}
              complete
              small
            />
          </div>

          <Atitle className="adminEditRuleBook__intl" level={2}>
            {t('adminEditRuleBook.i18n', { ns: 'pages' })}
          </Atitle>
          <Ap className="adminEditRuleBook__intl-info">
            {t('adminEditRuleBook.i18nInfo', { ns: 'pages' })}
          </Ap>
          <div className="adminEditRuleBook__basics">
            <Input
              type="text"
              label={`${t('nameRuleBook.label', { ns: 'fields' })} (FR)`}
              onChange={(e) => {
                setRuleBookNameFr(e.target.value);
              }}
              value={ruleBookNameFr}
              className="adminEditRuleBook__basics__name"
            />
          </div>
          <div className="adminEditRuleBook__details">
            <RichTextElement
              label={`${t('ruleBookSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={ruleBookSummaryFr}
              ruleBookId={id}
              complete
              small
            />
          </div>
          <Button
            onClick={() => {
              onSaveRuleBook();
            }}
            disabled={error !== ''}
          >
            {t('adminEditRuleBook.button', { ns: 'pages' })}
          </Button>
        </div>
        <div className="adminEditRuleBook__content__right">
          <div className="adminEditRuleBook__block-children">
            <Atitle className="adminEditRuleBook__intl" level={2}>
              {t('adminEditRuleBook.chapters', { ns: 'pages' })}
            </Atitle>
            <DragList data={chapterDragData} id="main" onChange={onChapterOrder} />
            <div className="adminEditRuleBook__block-children__buttons">
              {!arraysEqual(chaptersOrder, initialOrder) ? (
                <Button onClick={onUpdateOrder}>
                  {t('adminEditRuleBook.updateOrder', { ns: 'pages' })}
                </Button>
              ) : null}
              <Button href={`/admin/chapter/new?ruleBookId=${id}&type=${defaultTypeChapterId}`}>
                {t('adminEditRuleBook.createDefaultChapter', { ns: 'pages' })}
              </Button>
            </div>
          </div>
          <div className="adminEditRuleBook__block-children">
            <Atitle className="adminEditRuleBook__intl" level={2}>
              {t('adminEditRuleBook.notions', { ns: 'pages' })}
            </Atitle>
            {notionsListDom ?? null}
            <Button href={`/admin/notion/new?ruleBookId=${id}`}>
              {t('adminEditRuleBook.createNotion', { ns: 'pages' })}
            </Button>
          </div>
          <div className="adminEditRuleBook__block-children">
            <SmartSelect
              label={t('draftRuleBook.select', { ns: 'fields' })}
              options={draftChoices}
              selected={sentDraftChoice}
              onChange={(choice) => {
                onChangeDraftState(choice.value);
                setError('');
              }}
              className="adminEditRuleBook__basics__type"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditRuleBooks;
