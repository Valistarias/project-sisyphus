import React, { useCallback, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert } from '../../organisms';

import type { ErrorResponseType } from '../../types';

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
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    ({ mail }) => {
      if (api !== undefined) {
        api.mailToken
          .create({ mail })
          .then(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>
                    {t('forgotPass.successSent', {
                      ns: 'pages',
                      mail,
                    })}
                  </Ap>
                </Alert>
              ),
            });
            void navigate('/login');
          })
          .catch(({ response }: ErrorResponseType) => {
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
    [api, createAlert, getNewId, navigate, setError, t]
  );

  return (
    <div className="forgot-pass">
      <Atitle level={1}>{t('forgotPass.title', { ns: 'pages' })}</Atitle>
      <form
        className="forgot-pass__form"
        onSubmit={(evt) => {
          void handleSubmit(onSubmit)(evt);
        }}
        noValidate
      >
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <Input
          control={control}
          inputName="mail"
          type="email"
          rules={{
            required: t('mail.required', { ns: 'fields' }),
            pattern: {
              value: regexMail,
              message: t('mail.pattern', { ns: 'fields' }),
            },
          }}
          label={t('mail.label', { ns: 'fields' })}
          autoComplete="username"
        />
        <Button type="submit">{t('forgotPass.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
