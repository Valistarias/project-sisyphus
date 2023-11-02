import React, { type FC } from 'react';
import i18next from 'i18next';

import { useTranslation } from 'react-i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSystemAlerts } from '../../providers/systemAlerts';
import { useApi } from '../../providers/api';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert } from '../../organisms';

import { regexMail } from '../../utils';

import './forgotPass.scss';

interface FormValues {
  mail: string;
}

const ForgotPassword: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ mail }) => {
    if (api !== undefined) {
      api.mailToken
        .create({
          mail,
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('forgotPass.successSent', { ns: 'pages', mail })}</Ap>
              </Alert>
            ),
          });
          navigate('/login');
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
  };

  return (
    <div className="forgot-pass">
      <Atitle level={1}>{t('forgotPass.title', { ns: 'pages' })}</Atitle>
      <form className="forgot-pass__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <Input
          type="email"
          registered={register('mail', {
            required: t('mail.required', { ns: 'fields' }),
            pattern: {
              value: regexMail,
              message: t('mail.pattern', { ns: 'fields' }),
            },
          })}
          label={t('mail.label', { ns: 'fields' })}
          autoComplete="username"
        />
        {errors.mail?.message !== undefined ? <Aerror>{errors.mail.message}</Aerror> : null}
        <Button type="submit">{t('forgotPass.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
