import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, LinkButton } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedArcane } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditArcane.scss';

interface FormValues {
  name: string;
  nameFr: string;
  number: number;
}

const AdminEditArcane: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadArcanes } = useGlobalVars();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [arcaneData, setArcaneData] = useState<ICuratedArcane | null>(null);

  const [arcaneText, setArcaneText] = useState('');
  const [arcaneTextFr, setArcaneTextFr] = useState('');

  const textEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const textFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const createDefaultData = useCallback((arcaneData: ICuratedArcane | null) => {
    if (arcaneData == null) {
      return {};
    }
    const { arcane, i18n } = arcaneData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = arcane.title;
    defaultData.number = arcane.number;
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
    defaultValues: useMemo(() => createDefaultData(arcaneData), [createDefaultData, arcaneData]),
  });

  const onSaveArcane: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, number }) => {
      if (textEditor === null || textFrEditor === null || api === undefined) {
        return;
      }
      let htmlText: string | null = textEditor.getHTML();

      const htmlTextFr = textFrEditor.getHTML();

      if (htmlText === '<p class="ap"></p>') {
        htmlText = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            text: htmlTextFr,
          },
        };
      }

      api.arcanes
        .update({
          id,
          title: name,
          summary: htmlText,
          number: Number(number),
          i18n,
        })
        .then((arcane) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditArcane.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadArcanes();
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, { field: 'Formula Id' })} by ${data.sent}`,
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
    [textEditor, textFrEditor, api, id, getNewId, createAlert, t, reloadArcanes, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditArcane.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditArcane.confirmDeletion.text', {
          ns: 'pages',
          elt: arcaneData?.arcane.title,
        }),
        confirmCta: t('adminEditArcane.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
            api.arcanes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditArcane.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadArcanes();
                void navigate('/admin/arcanes');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.arcane.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.arcane.name`), 'capitalize'),
                    }),
                  });
                }
              });
          }
          removeConfirmEventListener(evtId, confirmDelete);
        };
        addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    setConfirmContent,
    t,
    arcaneData?.arcane.title,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    reloadArcanes,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.arcanes
        .get({ arcaneId: id })
        .then((curatedArcane) => {
          const { arcane, i18n } = curatedArcane;
          setArcaneData(curatedArcane);
          setArcaneText(arcane.summary);
          if (i18n.fr !== undefined) {
            setArcaneTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveArcane)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveArcane]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(arcaneData));
  }, [arcaneData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditArcane
        ${displayInt ? 'adminEditArcane--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSaveArcane)(evt);
        }}
        noValidate
        className="adminEditArcane__content"
      >
        <div className="adminEditArcane__head">
          <Atitle level={1}>{arcaneData?.arcane.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditArcane.delete', { ns: 'pages' })}
          </Button>
        </div>
        <LinkButton className="adminEditArcane__return-btn" href="/admin/arcanes" size="small">
          {t('adminEditArcane.return', { ns: 'pages' })}
        </LinkButton>
        <Atitle level={2}>{t('adminEditArcane.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror className="adminEditArcane__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditArcane__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameArcane.required', { ns: 'fields' }) }}
            label={t('nameArcane.label', { ns: 'fields' })}
            className="adminEditArcane__basics__name"
          />
          <div className="adminEditArcane__basics__class">
            <Input
              control={control}
              inputName="number"
              type="number"
              label={t('arcaneNumber.label', { ns: 'fields' })}
              rules={{ required: t('arcaneNumber.required', { ns: 'fields' }) }}
            />
          </div>
        </div>
        <div className="adminEditArcane__details">
          <RichTextElement
            label={t('arcaneSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={arcaneText}
            small
          />
        </div>
        <div className="adminEditArcane__intl-title">
          <div className="adminEditArcane__intl-title__content">
            <Atitle className="adminEditArcane__intl-title__title" level={2}>
              {t('adminEditArcane.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditArcane__intl-title__info">
              {t('adminEditArcane.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditArcane__intl-title__btn"
          />
        </div>
        <div className="adminEditArcane__intl">
          <div className="adminEditArcane__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameArcane.label', { ns: 'fields' })} (FR)`}
              className="adminEditArcane__basics__name"
            />
          </div>
          <div className="adminEditArcane__details">
            <RichTextElement
              label={`${t('arcaneSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={arcaneTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditArcane.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditArcane;
