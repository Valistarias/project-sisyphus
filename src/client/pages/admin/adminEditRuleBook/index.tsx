import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ali, Ap, Atitle, Aul } from '../../../atoms';
import { Button, Input, SmartSelect, type ISingleValueSelect } from '../../../molecules';
import {
  Alert,
  DragList,
  RichTextElement,
  completeRichTextElementExtentions,
  type IDragElt
} from '../../../organisms';

import type { IChapterType, ICuratedRuleBook, IRuleBookType } from '../../../types';

import { arraysEqual, formatDate } from '../../../utils';

import './adminEditRuleBook.scss';

interface FormValues {
  name: string
  nameFr: string
  type: string
  draft: string
}

const AdminEditRuleBook: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const confMessageEvt = useConfirmMessage();
  const navigate = useNavigate();
  const { reloadRuleBooks } = useGlobalVars();

  const calledApi = useRef<string | null>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [autoSaved, setAutoSaved] = useState<string | null>(null);

  const [ruleBookSummary, setRuleBookSummary] = useState('');
  const [ruleBookSummaryFr, setRuleBookSummaryFr] = useState('');

  const [archived, setArchived] = useState<boolean>(false);

  const [draftChoices] = useState([
    {
      value: 'draft',
      label: i18next.format(t('terms.ruleBook.draft'), 'capitalize')
    },
    {
      value: 'published',
      label: i18next.format(t('terms.ruleBook.published'), 'capitalize')
    }
  ]);

  const [rulebookData, setRulebookData] = useState<ICuratedRuleBook | null>(null);

  const [ruleBookTypes, setRuleBookTypes] = useState<ISingleValueSelect[]>([]);

  const [defaultTypeChapterId, setDefaultTypeChapterId] = useState<string | null>(null);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [chaptersOrder, setChaptersOrder] = useState<string[]>([]);

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const createDefaultData = useCallback(
    (ruleBookTypes: ISingleValueSelect[], rulebookData: ICuratedRuleBook | null) => {
      if (rulebookData == null) {
        return {};
      }
      const { ruleBook, i18n } = rulebookData;
      const sentApiType = ruleBook.type._id;
      const defaultData: Partial<FormValues> = {};
      defaultData.draft = ruleBook.draft ? 'draft' : 'published';
      defaultData.name = ruleBook.title ?? '';
      if (sentApiType != null && ruleBookTypes.length > 0) {
        defaultData.type = String(
          ruleBookTypes.find(ruleBookType => ruleBookType.value === sentApiType)?.value
        );
      }
      if (i18n.fr !== undefined) {
        defaultData.nameFr = i18n.fr.title ?? '';
      }

      return defaultData;
    },
    []
  );

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultData(ruleBookTypes, rulebookData),
      [createDefaultData, ruleBookTypes, rulebookData]
    )
  });

  const notionsListDom = useMemo(() => {
    const notionsData = rulebookData?.ruleBook.notions ?? [];
    if (notionsData.length === 0) {
      return null;
    }

    return (
      <Aul className="adminEditRuleBook__notion-list" noPoints>
        {notionsData.map(notion => (
          <Ali className="adminEditRuleBook__notion-list__elt" key={notion._id}>
            <Atitle level={4}>{notion.title}</Atitle>
            <Button size="small" href={`/admin/notion/${notion._id}`}>
              {t('adminEditRuleBook.editNotion', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [rulebookData, t]);

  const chapterDragData = useMemo(() => {
    const chaptersData = rulebookData?.ruleBook.chapters ?? [];
    if (chaptersData.length === 0) {
      return {};
    }

    const chapters: Record<string, IDragElt> = {};
    chaptersData.forEach((chapterData) => {
      chapters[chapterData._id] = {
        id: chapterData._id,
        title: chapterData.title,
        button: {
          href: `/admin/chapter/${chapterData._id}`,
          content: t('adminEditRuleBook.editChapter', { ns: 'pages' })
        }
      };
    });

    return chapters;
  }, [rulebookData, t]);

  const onChapterOrder = useCallback((elt: string[], isInitial: boolean) => {
    setChaptersOrder(elt);
    if (isInitial) {
      setInitialOrder(elt);
    }
  }, []);

  const onSaveRuleBook: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, type, draft }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr
          }
        };
      }

      api.ruleBooks
        .update({
          id,
          title: name,
          type,
          summary: html,
          draft: draft === 'draft',
          i18n
        })
        .then(() => {
          if (!silentSave.current) {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
                </Alert>
              )
            });
            reloadRuleBooks();
          } else {
            const date = formatDate(new Date(Date.now()));
            setAutoSaved(
              t('autosave', {
                date: date.date,
                hour: date.hour,
                ns: 'components'
              })
            );
          }
          silentSave.current = false;
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
              })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    },
    [introEditor, introFrEditor, api, id, getNewId, createAlert, t, reloadRuleBooks, setError]
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
          position: index
        }))
      })
      .then(() => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
            </Alert>
          )
        });
        setInitialOrder(chaptersOrder);
      })
      .catch(({ response }) => {
        const { data } = response;
        if (data.code === 'CYPU-104') {
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
            })
          });
        } else {
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
            })
          });
        }
      });
  }, [chaptersOrder, initialOrder, api, id, getNewId, createAlert, t, setError]);

  const onAskArchive = useCallback(() => {
    if (api === undefined || id === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
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
          { ns: 'pages', elt: rulebookData?.ruleBook.title }
        ),
        confirmCta: t(
          archived
            ? 'adminEditRuleBook.confirmUnarchive.confirmCta'
            : 'adminEditRuleBook.confirmArchive.confirmCta',
          { ns: 'pages' }
        ),
        theme: archived ? 'info' : 'error'
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
                  )
                });
                reloadRuleBooks();
                void navigate('/admin/rulebooks');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
                    })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
                    })
                  });
                }
              });
          }
          confMessageEvt.removeConfirmEventListener(evtId, confirmArchive);
        };
        confMessageEvt.addConfirmEventListener(evtId, confirmArchive);
      }
    );
  }, [api, id, confMessageEvt, t, archived, rulebookData?.ruleBook.title, getNewId, createAlert, reloadRuleBooks, navigate, setError]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && calledApi.current !== id) {
      calledApi.current = id;
      api.ruleBooks
        .get({ ruleBookId: id })
        .then((curatedRuleBook: ICuratedRuleBook) => {
          setRulebookData(curatedRuleBook);
          setArchived(curatedRuleBook.ruleBook.archived);
          setRuleBookSummary(curatedRuleBook.ruleBook.summary);
          if (curatedRuleBook.i18n.fr !== undefined) {
            setRuleBookSummaryFr(curatedRuleBook.i18n.fr.summary ?? '');
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
            )
          });
        });
      api.ruleBookTypes
        .getAll()
        .then((data: IRuleBookType[]) => {
          setRuleBookTypes(
            data.map(ruleBookType => ({
              value: ruleBookType._id,
              label: t(`ruleBookTypeNames.${ruleBookType.name}`, { count: 1 }),
              details: ruleBookType.name
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
            )
          });
        });
      api.chapterTypes
        .getAll()
        .then((data: IChapterType[]) => {
          setDefaultTypeChapterId(
            data.find(chapterType => chapterType.name === 'default')?._id ?? null
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
            )
          });
        });
    }
  }, [api, createAlert, getNewId, ruleBookTypes, id, t]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveRuleBook)().then(
        () => {},
        () => {}
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveRuleBook]);

  // Default data
  useEffect(() => {
    reset(createDefaultData(ruleBookTypes, rulebookData));
  }, [ruleBookTypes, rulebookData, reset, createDefaultData]);

  return (
    <div className="adminEditRuleBook">
      <div className="adminEditRuleBook__head">
        <Atitle level={1}>{t('adminEditRuleBook.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskArchive} color={archived ? 'tertiary' : 'error'}>
          {t(archived ? 'adminEditRuleBook.unarchive' : 'adminEditRuleBook.archive', {
            ns: 'pages'
          })}
        </Button>
      </div>
      {autoSaved !== null ? <Ap className="adminEditRuleBook__autosave">{autoSaved}</Ap> : null}
      <div className="adminEditRuleBook__content">
        <form
          className="adminEditRuleBook__content__left"
          onSubmit={handleSubmit(onSaveRuleBook)}
          noValidate
        >
          {errors.root?.serverError.message !== undefined
            ? (
                <Aerror>{errors.root.serverError.message}</Aerror>
              )
            : null}
          <div className="adminEditRuleBook__basics">
            <Input
              control={control}
              inputName="name"
              type="text"
              rules={{
                required: t('nameRuleBook.required', { ns: 'fields' })
              }}
              label={t('nameRuleBook.label', { ns: 'fields' })}
              className="adminEditRuleBook__basics__name"
            />
            <SmartSelect
              control={control}
              inputName="type"
              rules={{
                required: t('typeRuleBook.required', { ns: 'fields' })
              }}
              label={t('typeRuleBook.select', { ns: 'fields' })}
              options={ruleBookTypes}
              className="adminEditRuleBook__basics__type"
            />
            <SmartSelect
              control={control}
              inputName="draft"
              label={t('draftRuleBook.select', { ns: 'fields' })}
              options={draftChoices}
              className="adminEditRuleBook__basics__type"
            />
          </div>
          <div className="adminEditRuleBook__details">
            <RichTextElement
              label={t('ruleBookSummary.title', { ns: 'fields' })}
              editor={introEditor ?? undefined}
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
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameRuleBook.label', { ns: 'fields' })} (FR)`}
              className="adminEditRuleBook__basics__name"
            />
          </div>
          <div className="adminEditRuleBook__details">
            <RichTextElement
              label={`${t('ruleBookSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor ?? undefined}
              rawStringContent={ruleBookSummaryFr}
              ruleBookId={id}
              complete
              small
            />
          </div>
          <Button type="submit">{t('adminEditRuleBook.button', { ns: 'pages' })}</Button>
        </form>
        <div className="adminEditRuleBook__content__right">
          <div className="adminEditRuleBook__block-children">
            <Atitle className="adminEditRuleBook__intl" level={2}>
              {t('adminEditRuleBook.chapters', { ns: 'pages' })}
            </Atitle>
            <DragList
              className="adminEditRuleBook__draglist"
              data={chapterDragData}
              id="main"
              onChange={onChapterOrder}
            />
            <div className="adminEditRuleBook__block-children__buttons">
              {!arraysEqual(chaptersOrder, initialOrder)
                ? (
                    <Button onClick={onUpdateOrder}>
                      {t('adminEditRuleBook.updateOrder', { ns: 'pages' })}
                    </Button>
                  )
                : null}
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
        </div>
      </div>
    </div>
  );
};

export default AdminEditRuleBook;
