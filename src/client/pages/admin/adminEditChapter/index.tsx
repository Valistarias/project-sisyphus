import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useNavigate, useParams
} from 'react-router-dom';

import {
  useApi, useConfirmMessage, useSystemAlerts
} from '../../../providers';

import {
  Aa, Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input
} from '../../../molecules';
import {
  Alert,
  DragList,
  RichTextElement,
  completeRichTextElementExtentions,
  type IDragElt
} from '../../../organisms';

import type {
  ICuratedChapter, IPage
} from '../../../types';

import {
  arraysEqual, formatDate
} from '../../../utils';

import './adminEditChapter.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminEditChapters: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { id } = useParams();
  const confMessageEvt = useConfirmMessage();
  const navigate = useNavigate();

  const calledApi = useRef<string | null>(null);

  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const [autoSaved, setAutoSaved] = useState<string | null>(null);
  const silentSave = useRef(false);

  const [chapterData, setChapterData] = useState<ICuratedChapter | null>(null);

  const [chapterSummary, setChapterSummary] = useState('');
  const [chapterSummaryFr, setChapterSummaryFr] = useState('');

  const [pagesData, setPagesData] = useState<IPage[] | null>(null);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [pagesOrder, setPagesOrder] = useState<string[]>([]);

  const introEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const introFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const createDefaultData = useCallback((chapterData: ICuratedChapter | null) => {
    if (chapterData == null) {
      return {};
    }
    const {
      chapter, i18n
    } = chapterData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = chapter.title;
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }

    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset
  } = useForm({ defaultValues: useMemo(() => createDefaultData(chapterData), [createDefaultData, chapterData]) });

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
          content: t('adminEditChapter.editPage', { ns: 'pages' })
        }
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

  const ruleBook = useMemo(() => chapterData?.chapter.ruleBook, [chapterData]);

  const onSaveChapter: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr
    }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr
        } };
      }

      api.chapters
        .update({
          id,
          title: name,
          summary: html,
          i18n
        })
        .then(() => {
          if (!silentSave.current) {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminEditChapter.successUpdate', { ns: 'pages' })}</Ap>
                </Alert>
              )
            });
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
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize') })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      setError
    ]
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
          position: index
        }))
      })
      .then(() => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditChapter.successUpdate', { ns: 'pages' })}</Ap>
            </Alert>
          )
        });
        setInitialOrder(pagesOrder);
      })
      .catch(({ response }: ErrorResponseType) => {
        const { data } = response;
        if (data.code === 'CYPU-104') {
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize') })
          });
        } else {
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize') })
          });
        }
      });
  }, [
    pagesOrder,
    initialOrder,
    api,
    id,
    getNewId,
    createAlert,
    t,
    setError
  ]);

  const onAskDelete = useCallback(() => {
    if (api === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditChapter.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditChapter.confirmDeletion.text', {
          ns: 'pages',
          elt: chapterData?.chapter.title
        }),
        confirmCta: t('adminEditChapter.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
            { detail }: { detail: ConfirmMessageDetailData }
          ): void => {
            if (detail.proceed) {
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
                  )
                });
                void navigate(`/admin/rulebook/${ruleBook?._id}`);
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize') })
                  });
                }
              });
          }
          confMessageEvt.removeConfirmEventListener(evtId, confirmDelete);
        };
        confMessageEvt.addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    confMessageEvt,
    t,
    chapterData?.chapter.title,
    id,
    getNewId,
    createAlert,
    navigate,
    ruleBook?._id,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && calledApi.current !== id) {
      calledApi.current = id;
      api.chapters
        .get({ chapterId: id })
        .then((curatedChapter) => {
          const {
            chapter, i18n
          } = curatedChapter;
          setChapterData(curatedChapter);
          setChapterSummary(chapter.summary);
          setPagesData(chapter.pages ?? null);
          if (i18n.fr !== undefined) {
            setChapterSummaryFr(i18n.fr.summary ?? '');
          }
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
    id,
    t
  ]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveChapter)().then(
        () => {},
        () => {}
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveChapter]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(chapterData));
  }, [
    chapterData,
    reset,
    createDefaultData
  ]);

  return (
    <div className="adminEditChapter">
      <div className="adminEditChapter__head">
        <Atitle level={1}>{t('adminEditChapter.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskDelete} color="error">
          {t('adminEditChapter.delete', { ns: 'pages' })}
        </Button>
      </div>
      <div className="adminEditChapter__ariane">
        <Ap className="adminEditChapter__ariane__elt">
          {`${t(`terms.ruleBook.ruleBook`)}: `}
          <Aa href={`/admin/rulebook/${ruleBook?._id}`}>{ruleBook?.title!}</Aa>
        </Ap>
      </div>
      {autoSaved !== null ? <Ap className="adminEditChapter__autosave">{autoSaved}</Ap> : null}
      <div className="adminEditChapter__content">
        <form
          onSubmit={() => handleSubmit(onSaveChapter)}
          noValidate
          className="adminEditChapter__content__left"
        >
          {errors.root?.serverError.message !== undefined
            ? (
                <Aerror>{errors.root.serverError.message}</Aerror>
              )
            : null}
          <div className="adminEditChapter__basics">
            <Input
              control={control}
              inputName="name"
              rules={{ required: t('nameChapter.required', { ns: 'fields' }) }}
              type="text"
              label={t('nameChapter.label', { ns: 'fields' })}
              className="adminEditChapter__basics__name"
            />
          </div>
          <div className="adminEditChapter__details">
            <RichTextElement
              label={t('chapterSummary.title', { ns: 'fields' })}
              editor={introEditor ?? undefined}
              rawStringContent={chapterSummary}
              ruleBookId={ruleBook?._id}
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
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameChapter.label', { ns: 'fields' })} (FR)`}
              className="adminEditChapter__basics__name"
            />
          </div>
          <div className="adminEditChapter__details">
            <RichTextElement
              label={`${t('chapterSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor ?? undefined}
              rawStringContent={chapterSummaryFr}
              ruleBookId={ruleBook?._id}
              complete
              small
            />
          </div>
          <Button type="submit">{t('adminEditChapter.button', { ns: 'pages' })}</Button>
        </form>
        <div className="adminEditChapter__content__right">
          <div className="adminEditChapter__block-children">
            <Atitle className="adminEditChapter__intl" level={2}>
              {t('adminEditChapter.pages', { ns: 'pages' })}
            </Atitle>
            <DragList
              data={pageDragData}
              className="adminEditChapter__draglist"
              id="main"
              onChange={onPageOrder}
            />
            <div className="adminEditRuleBook__block-children__buttons">
              {!arraysEqual(pagesOrder, initialOrder)
                ? (
                    <Button onClick={onUpdateOrder}>
                      {t('adminEditRuleBook.updateOrder', { ns: 'pages' })}
                    </Button>
                  )
                : null}
              <Button href={`/admin/page/new?chapterId=${id}&ruleBookId=${ruleBook?._id}`}>
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
