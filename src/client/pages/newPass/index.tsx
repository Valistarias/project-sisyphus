import React, { useCallback, useEffect, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert } from '../../organisms';

import './newPass.scss';

interface FormValues {
  mail: string;
  password: string;
  confirmPassword: string;
}

const NewPassword: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const { userId, token } = useParams();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    ({ password, confirmPassword }) => {
      if (api !== undefined && userId !== undefined && token !== undefined) {
        api.auth
          .passUpdate({
            userId,
            token,
            pass: password,
            confirmPass: confirmPassword,
          })
          .then(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('newPass.success', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            void navigate('/login');
          })
          .catch(({ response }) => {
            const { data } = response;
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.user.${data.sent}`), 'capitalize'),
              }),
            });
          });
      }
    },
    [api, createAlert, getNewId, navigate, setError, t, token, userId]
  );

  useEffect(() => {
    if (api !== undefined && userId !== undefined && token !== undefined) {
      api.mailToken
        .getMail({
          userId,
          token,
        })
        .then((mail) => {
          setValue('mail', mail);
        })
        .catch(() => {
          void navigate('/');
        });
    }
  }, [userId, token, api, setValue, navigate]);

  return (
    <div className="new-pass">
      <Atitle level={1}>{t('newPass.title', { ns: 'pages' })}</Atitle>
      <form className="new-pass__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <Input
          type="email"
          control={control}
          inputName="mail"
          autoComplete="username"
          hidden
          readOnly
        />
        <Input
          control={control}
          inputName="password"
          type="password"
          rules={{
            required: t('password.required', { ns: 'fields' }),
          }}
          label={t('password.label', { ns: 'fields' })}
          autoComplete="new-password"
        />
        <Input
          control={control}
          inputName="confirmPassword"
          type="password"
          rules={{
            required: t('confirmPassword.required', { ns: 'fields' }),
            validate: (val: string) => {
              if (watch('password') !== val) {
                return t('confirmPassword.validate', { ns: 'fields' });
              }
            },
          }}
          label={t('confirmPassword.label', { ns: 'fields' })}
          autoComplete="new-password"
        />
        <Button type="submit">{t('newPass.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default NewPassword;
