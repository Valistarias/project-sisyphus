import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, IItemType } from '../../../types';

import './adminEditItemType.scss';

interface FormValues {
  name: string;
}

const AdminEditItemType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadItemTypes } = useGlobalVars();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [itemTypeData, setItemTypeData] = useState<IItemType | null>(null);

  const createDefaultData = useCallback((itemTypeData: IItemType | null) => {
    if (itemTypeData == null) {
      return {};
    }
    const defaultData: Partial<FormValues> = {};
    defaultData.name = itemTypeData.name;

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
      () => createDefaultData(itemTypeData),
      [createDefaultData, itemTypeData]
    ),
  });

  const onSaveItemType: SubmitHandler<FormValues> = useCallback(
    ({ name }) => {
      if (api === undefined) {
        return;
      }

      api.itemTypes
        .update({
          id,
          name,
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditItemType.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadItemTypes();
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
    [api, id, getNewId, createAlert, t, reloadItemTypes, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditItemType.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditItemType.confirmDeletion.text', {
          ns: 'pages',
          elt: itemTypeData?.name,
        }),
        confirmCta: t('adminEditItemType.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
            api.itemTypes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditItemType.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadItemTypes();
                void navigate('/admin/itemtypes');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.itemType.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.itemType.name`), 'capitalize'),
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
    itemTypeData?.name,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    reloadItemTypes,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.itemTypes
        .get({ itemTypeId: id })
        .then((itemType) => {
          setItemTypeData(itemType);
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
      handleSubmit(onSaveItemType)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveItemType]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(itemTypeData));
  }, [itemTypeData, reset, createDefaultData]);

  return (
    <div className="adminEditItemType">
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSaveItemType)(evt);
        }}
        noValidate
        className="adminEditItemType__content"
      >
        <div className="adminEditItemType__head">
          <Atitle level={1}>{itemTypeData?.name}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditItemType.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Atitle level={2}>{t('adminEditItemType.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror className="adminEditItemType__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditItemType__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameItemType.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('nameItemType.format', { ns: 'fields' }),
              },
            }}
            label={t('nameItemType.label', { ns: 'fields' })}
            className="adminEditItemType__basics__name"
          />
        </div>
        <Button type="submit">{t('adminEditItemType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditItemType;
