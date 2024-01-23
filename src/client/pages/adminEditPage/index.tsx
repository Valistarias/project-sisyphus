import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useSystemAlerts } from '../../providers';

import { Aa, Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import type { ICuratedPage } from '../../types/data';

import { formatDate } from '../../utils';

import './adminEditPage.scss';

interface FormValues {
  name: string;
  nameFr: string;
}

const AdminEditPages: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const navigate = useNavigate();

  const calledApi = useRef<string | null>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [autoSaved, setAutoSaved] = useState<string | null>(null);

  const [pageData, setPageData] = useState<ICuratedPage | null>(null);

  const [pageContent, setPageContent] = useState('');
  const [pageContentFr, setPageContentFr] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((pageData: ICuratedPage | null) => {
    if (pageData == null) {
      return {};
    }
    const { page, i18n } = pageData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = page.title;
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
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(pageData), [createDefaultData, pageData]),
  });

  const ruleBook = useMemo(() => pageData?.page.chapter.ruleBook, [pageData]);
  const chapter = useMemo(() => pageData?.page.chapter, [pageData]);

  const onSavePage: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr }) => {
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
            content: htmlFr,
          },
        };
      }

      api.pages
        .update({
          id,
          title: name,
          content: html,
          i18n,
        })
        .then(() => {
          if (!silentSave.current) {
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
          silentSave.current = false;
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [introEditor, introFrEditor, api, id, getNewId, createAlert, t, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || chapter == null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditPage.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditPage.confirmDeletion.text', { ns: 'pages', elt: chapter.title }),
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
                navigate(`/admin/chapter/${chapter._id}`);
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize'),
                    }),
                  });
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
    chapter,
    setConfirmContent,
    t,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && calledApi.current !== id) {
      calledApi.current = id;
      api.pages
        .get({ pageId: id })
        .then((curatedPage: ICuratedPage) => {
          const { page, i18n } = curatedPage;
          setPageData(curatedPage);

          setPageContent(page.content);
          if (curatedPage.i18n.fr !== undefined) {
            setPageContentFr((i18n.fr.content as string) ?? '');
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
      silentSave.current = true;
      handleSubmit(onSavePage)().then(
        () => {},
        () => {}
      );
    }, 300000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSavePage]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(pageData));
  }, [pageData, reset, createDefaultData]);

  return (
    <div className="adminEditPage">
      <div className="adminEditPage__head">
        <Atitle level={1}>{t('adminEditPage.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskDelete} color="error">
          {t('adminEditPage.delete', { ns: 'pages' })}
        </Button>
      </div>
      <div className="adminEditPage__ariane">
        <Ap className="adminEditPage__ariane__elt">
          {`${t(`terms.ruleBook.ruleBook`)}: `}
          <Aa href={`/admin/rulebook/${ruleBook?._id}`}>{ruleBook?.title as string}</Aa>
        </Ap>
        <Ap className="adminEditPage__ariane__elt">
          {`${t(`terms.ruleBook.chapter`)}: `}
          <Aa href={`/admin/chapter/${chapter?._id}`}>{chapter?.title as string}</Aa>
        </Ap>
      </div>
      {autoSaved !== null ? <Ap className="adminEditPage__autosave">{autoSaved}</Ap> : null}
      <div className="adminEditPage__content">
        <form
          onSubmit={handleSubmit(onSavePage)}
          noValidate
          className="adminEditPage__content__left"
        >
          {errors.root?.serverError?.message !== undefined ? (
            <Aerror>{errors.root.serverError.message}</Aerror>
          ) : null}
          <div className="adminEditPage__basics">
            <Input
              control={control}
              inputName="name"
              rules={{
                required: t('namePage.required', { ns: 'fields' }),
              }}
              type="text"
              label={t('namePage.label', { ns: 'fields' })}
              className="adminEditPage__basics__name"
            />
          </div>
          <div className="adminEditPage__details">
            <RichTextElement
              label={t('pageContent.title', { ns: 'fields' })}
              editor={introEditor ?? undefined}
              rawStringContent={pageContent}
              ruleBookId={ruleBook?._id}
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
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('namePage.label', { ns: 'fields' })} (FR)`}
              className="adminEditPage__basics__name"
            />
          </div>
          <div className="adminEditPage__details">
            <RichTextElement
              label={`${t('pageContent.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor ?? undefined}
              rawStringContent={pageContentFr}
              ruleBookId={ruleBook?._id}
              complete
              small
            />
          </div>
          <Button type="submit">{t('adminEditPage.button', { ns: 'pages' })}</Button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditPages;
