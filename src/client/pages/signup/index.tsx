import React, { useCallback, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, LinkButton } from '../../molecules';
import { Alert } from '../../organisms';

import type { ErrorResponseType } from '../../types/global';

import { regexMail } from '../../utils';

import './signup.scss';

interface FormValues {
  username: string;
  mail: string;
  password: string;
  confirmPassword: string;
}

const Signup: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    ({ username, mail, password }) => {
      if (api !== undefined) {
        api.auth
          .signup({
            username,
            mail,
            password,
          })
          .then(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>
                    {t('signup.successSent', {
                      ns: 'pages',
                      mail,
                    })}
                  </Ap>
                </Alert>
              ),
            });
            void navigate('/');
          })
          .catch(({ response }: ErrorResponseType) => {
            const { data } = response;
            if (data.code === 'CYPU-104') {
              setError(data.sent ?? '', {
                type: 'server',
                message: t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.user.${data.sent}`), 'capitalize'),
                }),
              });
            } else {
              setError('root.serverError', {
                type: 'server',
                message: t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.user.${data.sent}`), 'capitalize'),
                }),
              });
            }
          });
      }
    },
    [api, createAlert, getNewId, navigate, setError, t]
  );

  return (
    <div className="signup">
      <div className="signup__main">
        <Atitle level={1}>{t('signup.title', { ns: 'pages' })}</Atitle>
        <form
          className="signup__main__form"
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
            inputName="username"
            rules={{ required: t('username.required', { ns: 'fields' }) }}
            type="text"
            label={t('username.label', { ns: 'fields' })}
          />
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
            autoComplete="email"
          />
          <Input
            control={control}
            inputName="password"
            type="password"
            rules={{ required: t('password.required', { ns: 'fields' }) }}
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

          <div className="signup__main__buttons">
            <Button type="submit">{t('signup.formCTA', { ns: 'pages' })}</Button>
            <LinkButton href="/login" theme="text-only">
              {t('signup.loginCTA', { ns: 'pages' })}
            </LinkButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
