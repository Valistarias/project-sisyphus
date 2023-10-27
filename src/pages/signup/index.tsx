import React, { type FC } from 'react';
import i18next from 'i18next';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSystemAlerts } from '../../providers/systemAlerts';
import { useApi } from '../../providers/api';

import { Aerror, Ainput, Ap } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';

import { regexMail } from '../../utils';

import './signup.scss';

interface FormValues {
  mail: string
  password: string
  confirmPassword: string
}

const Signup: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ mail, password }) => {
    if (api !== undefined) {
      api.auth.signup({
        mail,
        password
      })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert
                key={newId}
                id={newId}
                timer={5}
              >
                <Ap>{t('signup.successSent', { ns: 'pages', mail })}</Ap>
              </Alert>
            )
          });
          navigate('/');
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError(data.sent, {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.user.${data.sent}`), 'capitalize')
              })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.user.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    }
  };

  return (
    <div className="signup">
      <h1>{t('signup.title', { ns: 'pages' })}</h1>
      <form className="signup__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root?.serverError?.message !== undefined ? (<Aerror>{errors.root.serverError.message}</Aerror>) : null}
        <Ainput
          type="email"
          registered={register('mail', {
            required: t('mail.required', { ns: 'fields' }),
            pattern: {
              value: regexMail,
              message: t('mail.pattern', { ns: 'fields' })
            }
          })}
          placeholder={t('mail.placeholder', { ns: 'fields' })}
          autoComplete="email"
        />
        {errors.mail?.message !== undefined ? (<Aerror>{errors.mail.message}</Aerror>) : null}
        <Ainput
          type="password"
          registered={register('password', {
            required: t('password.required', { ns: 'fields' })
          })}
          placeholder={t('password.placeholder', { ns: 'fields' })}
          autoComplete="new-password"
        />
        {errors.password?.message !== undefined ? (<Aerror>{errors.password.message}</Aerror>) : null}
        <Ainput
          type="password"
          registered={register('confirmPassword', {
            required: t('confirmPassword.required', { ns: 'fields' }),
            validate: (val: string) => {
              if (watch('password') !== val) {
                return t('confirmPassword.validate', { ns: 'fields' });
              }
            }
          })}
          placeholder={t('confirmPassword.placeholder', { ns: 'fields' })}
          autoComplete="new-password"
        />
        {errors.confirmPassword?.message !== undefined ? (<Aerror>{errors.confirmPassword.message}</Aerror>) : null}
        <Button type="submit">
          {t('signup.formCTA', { ns: 'pages' })}
        </Button>
      </form>

    </div>
  );
};

export default Signup;
