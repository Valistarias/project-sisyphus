import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useNavigate, useParams
} from 'react-router-dom';

import {
  useApi, useConfirmMessage, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input
} from '../../../molecules';
import { Alert } from '../../../organisms';

import type { IGlobalValue } from '../../../types';

import './adminEditGlobalValue.scss';

interface FormValues {
  name: string
  value: string
}

const AdminEditGlobalValue: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadGlobalValues } = useGlobalVars();
  const confMessageEvt = useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);

  const [globalValueData, setGlobalValueData] = useState<IGlobalValue | null>(null);

  const createDefaultData = useCallback((globalValueData: IGlobalValue | null) => {
    if (globalValueData == null) {
      return {};
    }
    const defaultData: Partial<FormValues> = {};
    defaultData.name = globalValueData.name;
    defaultData.value = globalValueData.value;

    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset
  } = useForm({ defaultValues: useMemo(
    () => createDefaultData(globalValueData),
    [createDefaultData, globalValueData]
  ) });

  const onSaveGlobalValue: SubmitHandler<FormValues> = useCallback(
    ({
      name, value
    }) => {
      if (name === null || api === undefined) {
        return;
      }

      api.globalValues
        .update({
          id,
          name,
          value
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditGlobalValue.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadGlobalValues();
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, { field: 'Formula Id' })} by ${data.sent}`
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadGlobalValues,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditGlobalValue.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditGlobalValue.confirmDeletion.text', {
          ns: 'pages',
          elt: globalValueData?.name
        }),
        confirmCta: t('adminEditGlobalValue.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
            { detail }: { detail: ConfirmMessageDetailData }
          ): void => {
            if (detail.proceed) {
            api.globalValues
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditGlobalValue.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                reloadGlobalValues();
                void navigate('/admin/globalvalues');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.globalValue.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.globalValue.name`), 'capitalize') })
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
    globalValueData?.name,
    id,
    getNewId,
    createAlert,
    reloadGlobalValues,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.globalValues
        .get({ globalValueId: id })
        .then((globalValue) => {
          setGlobalValueData(globalValue);
        })
        .catch(() => {
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

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(globalValueData));
  }, [
    globalValueData,
    reset,
    createDefaultData
  ]);

  return (
    <div className="adminEditGlobalValue">
      <form
        onSubmit={() => handleSubmit(onSaveGlobalValue)}
        noValidate
        className="adminEditGlobalValue__content"
      >
        <div className="adminEditGlobalValue__head">
          <Atitle level={1}>{globalValueData?.name}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditGlobalValue.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button
          className="adminEditGlobalValue__return-btn"
          href="/admin/globalvalues"
          size="small"
        >
          {t('adminEditGlobalValue.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditGlobalValue.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditGlobalValue__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditGlobalValue__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameGlobalValue.required', { ns: 'fields' }) }}
            label={t('nameGlobalValue.label', { ns: 'fields' })}
            className="adminEditGlobalValue__basics__name"
          />
          <Input
            control={control}
            inputName="value"
            type="text"
            rules={{ required: t('nameGlobalValueValue.required', { ns: 'fields' }) }}
            label={t('nameGlobalValueValue.label', { ns: 'fields' })}
            className="adminNewGlobalValue__basics__name"
          />
        </div>
        <Button type="submit">{t('adminEditGlobalValue.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditGlobalValue;
