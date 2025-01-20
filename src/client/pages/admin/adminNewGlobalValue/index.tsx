import React, {
  useCallback, useEffect, useRef, useState, type FC
} from 'react';

import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  useApi, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input
} from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ErrorResponseType } from '../../../types';

import './adminNewGlobalValue.scss';

interface FormValues {
  name: string
  value: string
}

const AdminNewGlobalValue: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadGlobalValues } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors }
  } = useForm();

  const onSaveGlobalValue: SubmitHandler<FormValues> = useCallback(
    ({
      name, value
    }) => {
      if (api === undefined) {
        return;
      }

      api.globalValues
        .create({
          name,
          value
        })
        .then((globalValue) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewGlobalValue.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadGlobalValues();
          void navigate(`/admin/globalvalue/${globalValue._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize') })
          });
        });
    },
    [
      api,
      getNewId,
      createAlert,
      t,
      reloadGlobalValues,
      navigate,
      setError
    ]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [
    api,
    createAlert,
    getNewId,
    t
  ]);

  return (
    <div className="adminNewGlobalValue">
      <form
        className="adminNewGlobalValue__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveGlobalValue)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewGlobalValue.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewGlobalValue__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameGlobalValue.required', { ns: 'fields' }) }}
            label={t('nameGlobalValue.label', { ns: 'fields' })}
            className="adminNewGlobalValue__basics__name"
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
        <Button type="submit">{t('adminNewGlobalValue.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewGlobalValue;
