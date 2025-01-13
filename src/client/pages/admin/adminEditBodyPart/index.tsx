import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ICuratedBodyPart } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditBodyPart.scss';

interface FormValues {
  name: string;
  nameFr: string;
  partId: string;
  limit: number;
}

const AdminEditBodyPart: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadBodyParts } = useGlobalVars();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [bodyPartData, setBodyPartData] = useState<ICuratedBodyPart | null>(null);

  const [bodyPartText, setBodyPartText] = useState('');
  const [bodyPartTextFr, setBodyPartTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((bodyPartData: ICuratedBodyPart | null) => {
    if (bodyPartData == null) {
      return {};
    }
    const { bodyPart, i18n } = bodyPartData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = bodyPart.title;
    defaultData.partId = bodyPart.partId;
    defaultData.limit = bodyPart.limit;
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
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultData(bodyPartData),
      [createDefaultData, bodyPartData]
    ),
  });

  const onSaveBodyPart: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, partId, limit }) => {
      if (
        bodyPartText === null ||
        bodyPartTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
        limit === null ||
        partId === null ||
        api === undefined
      ) {
        return;
      }
      let htmlText: string | null = textEditor.getHTML();

      const htmlTextFr = textFrEditor.getHTML();

      if (htmlText === '<p class="ap"></p>') {
        htmlText = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            text: htmlTextFr,
          },
        };
      }

      api.bodyParts
        .update({
          id,
          title: name,
          summary: htmlText,
          partId,
          limit: Number(limit),
          i18n,
        })
        .then((bodyPart) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditBodyPart.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadBodyParts();
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, {
                field: 'Formula Id',
              })} by ${data.sent}`,
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [
      bodyPartText,
      bodyPartTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadBodyParts,
      setError,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditBodyPart.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditBodyPart.confirmDeletion.text', {
          ns: 'pages',
          elt: bodyPartData?.bodyPart.title,
        }),
        confirmCta: t('adminEditBodyPart.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.bodyParts
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditBodyPart.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadBodyParts();
                void navigate('/admin/bodyparts');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.bodyPart.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.bodyPart.name`), 'capitalize'),
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
    setConfirmContent,
    t,
    bodyPartData?.bodyPart.title,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    reloadBodyParts,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.bodyParts
        .get({ bodyPartId: id })
        .then((curatedBodyPart: ICuratedBodyPart) => {
          const { bodyPart, i18n } = curatedBodyPart;
          setBodyPartData(curatedBodyPart);
          setBodyPartText(bodyPart.summary);
          if (i18n.fr !== undefined) {
            setBodyPartTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveBodyPart)().then(
        () => {},
        () => {}
      );
    }, 600000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveBodyPart]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(bodyPartData));
  }, [bodyPartData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditBodyPart
        ${displayInt ? 'adminEditBodyPart--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={handleSubmit(onSaveBodyPart)}
        noValidate
        className="adminEditBodyPart__content"
      >
        <div className="adminEditBodyPart__head">
          <Atitle level={1}>{bodyPartData?.bodyPart.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditBodyPart.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditBodyPart__return-btn" href="/admin/bodyparts" size="small">
          {t('adminEditBodyPart.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditBodyPart.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror className="adminEditBodyPart__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditBodyPart__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameBodyPart.required', { ns: 'fields' }) }}
            label={t('nameBodyPart.label', { ns: 'fields' })}
            className="adminEditBodyPart__basics__name"
          />
          <div className="adminEditBodyPart__basics__class">
            <Input
              control={control}
              inputName="limit"
              type="number"
              label={t('bodyPartLimit.label', { ns: 'fields' })}
              rules={{
                required: t('bodyPartLimit.required', { ns: 'fields' }),
              }}
            />
          </div>
        </div>
        <div className="adminEditBodyPart__details">
          <RichTextElement
            label={t('bodyPartSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={bodyPartText}
            small
          />
          <Input
            control={control}
            inputName="partId"
            type="text"
            rules={{
              required: t('bodyPartFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('bodyPartFormula.format', { ns: 'fields' }),
              },
            }}
            label={t('bodyPartFormula.label', { ns: 'fields' })}
          />
        </div>
        <div className="adminEditBodyPart__intl-title">
          <div className="adminEditBodyPart__intl-title__content">
            <Atitle className="adminEditBodyPart__intl-title__title" level={2}>
              {t('adminEditBodyPart.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditBodyPart__intl-title__info">
              {t('adminEditBodyPart.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditBodyPart__intl-title__btn"
          />
        </div>
        <div className="adminEditBodyPart__intl">
          <div className="adminEditBodyPart__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameBodyPart.label', { ns: 'fields' })} (FR)`}
              className="adminEditBodyPart__basics__name"
            />
          </div>
          <div className="adminEditBodyPart__details">
            <RichTextElement
              label={`${t('bodyPartSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={bodyPartTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditBodyPart.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditBodyPart;
