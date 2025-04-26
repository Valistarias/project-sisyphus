import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aa, Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedVow } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { formatDate } from '../../../utils';

import './adminEditVow.scss';

interface FormValues {
  name: string;
  nameFr: string;
}

const AdminEditVows: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();
  const navigate = useNavigate();
  const { clergies } = useGlobalVars();

  const calledApi = useRef<string | null>(null);

  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const [autoSaved, setAutoSaved] = useState<string | null>(null);
  const silentSave = useRef(false);

  const [vowData, setVowData] = useState<ICuratedVow | null>(null);

  const createDefaultData = useCallback((vowData: ICuratedVow | null) => {
    if (vowData == null) {
      return {};
    }
    const { vow, i18n } = vowData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = vow.title;
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
    defaultValues: useMemo(() => createDefaultData(vowData), [createDefaultData, vowData]),
  });

  const clergy = useMemo(() => {
    if (vowData === null) {
      return null;
    }
    const clergy = clergies.find((cleanClergy) => cleanClergy.clergy._id === vowData.vow.clergy);

    if (clergy === undefined) {
      return null;
    }

    return clergy;
  }, [clergies, vowData]);

  const onSaveVow: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr }) => {
      if (api === undefined) {
        return;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '') {
        i18n = {
          fr: {
            title: nameFr,
          },
        };
      }

      api.vows
        .update({
          id,
          title: name,
          i18n,
        })
        .then(() => {
          if (!silentSave.current) {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminEditVow.successUpdate', { ns: 'pages' })}</Ap>
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
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.vowType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.vowType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [api, id, getNewId, createAlert, t, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditVow.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditVow.confirmDeletion.text', {
          ns: 'pages',
          elt: vowData?.vow.title,
        }),
        confirmCta: t('adminEditVow.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
            api.vows
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditVow.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                void navigate(`/admin/clergy/${clergy?.clergy._id}`);
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.vowType.${data.sent}`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.vowType.${data.sent}`), 'capitalize'),
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
    vowData?.vow.title,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    navigate,
    clergy?.clergy._id,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && calledApi.current !== id) {
      calledApi.current = id;
      api.vows
        .get({ vowId: id })
        .then((curatedVow) => {
          setVowData(curatedVow);
        })
        .catch(({ response }: ErrorResponseType) => {
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
      handleSubmit(onSaveVow)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveVow]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(vowData));
  }, [vowData, reset, createDefaultData]);

  return (
    <div className="adminEditVow">
      <div className="adminEditVow__head">
        <Atitle level={1}>{t('adminEditVow.edit', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskDelete} color="error">
          {t('adminEditVow.delete', { ns: 'pages' })}
        </Button>
      </div>
      <div className="adminEditVow__ariane">
        <Ap className="adminEditVow__ariane__elt">
          {`${t(`terms.clergy.name`)}: `}
          <Aa href={`/admin/clergy/${clergy?.clergy._id}`}>{clergy?.clergy.title}</Aa>
        </Ap>
      </div>
      {autoSaved !== null ? <Ap className="adminEditVow__autosave">{autoSaved}</Ap> : null}
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSaveVow)(evt);
        }}
        noValidate
        className="adminEditVow__content"
      >
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditVow__basics">
          <Input
            control={control}
            inputName="name"
            rules={{ required: t('nameVow.required', { ns: 'fields' }) }}
            type="text"
            label={t('nameVow.label', { ns: 'fields' })}
            className="adminEditVow__basics__name"
          />
        </div>

        <Atitle className="adminEditVow__intl" level={2}>
          {t('adminEditVow.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditVow__intl-info">{t('adminEditVow.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminEditVow__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameVow.label', { ns: 'fields' })} (FR)`}
            className="adminEditVow__basics__name"
          />
        </div>
        <Button type="submit">{t('adminEditVow.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditVows;
