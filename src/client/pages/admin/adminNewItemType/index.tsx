import React, { useCallback, useEffect, useRef, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert } from '../../../organisms';

import './adminNewItemType.scss';

interface FormValues {
  name: string;
}

const AdminNewItemType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadItemTypes } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FieldValues>();

  const onSaveItemType: SubmitHandler<FormValues> = useCallback(
    ({ name }) => {
      if (name === null || api === undefined) {
        return;
      }

      api.itemTypes
        .create({
          name,
        })
        .then((itemType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewItemType.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadItemTypes();
          void navigate(`/admin/itemtype/${itemType._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize'),
            }),
          });
        });
    },
    [api, getNewId, createAlert, t, reloadItemTypes, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewItemType">
      <form
        className="adminNewItemType__content"
        onSubmit={handleSubmit(onSaveItemType)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewItemType.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewItemType__basics">
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
            className="adminNewItemType__basics__name"
          />
        </div>
        <Button type="submit">{t('adminNewItemType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewItemType;
