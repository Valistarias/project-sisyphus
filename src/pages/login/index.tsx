import React, { type FC } from 'react';
import i18next from 'i18next';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useGlobalVars } from '../../providers/globalVars';
import { useApi } from '../../providers/api';
import { useTranslation } from 'react-i18next';

import { Aa, Aerror, Ainput } from '../../atoms';
import { Button } from '../../molecules';
import { regexMail } from '../../utils';

import { type IUser } from '../../interfaces';

import './login.scss';

interface FormValues {
  mail: string
  password: string
}

const Login: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const { setUser } = useGlobalVars();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ mail, password }) => {
    if (api !== undefined) {
      api.auth.signin({
        mail,
        password
      })
        .then((data: IUser) => {
          setUser(data);
          navigate('/');
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-102') {
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
    <div className="login">
      <h1>{t('login.title', { ns: 'pages' })}</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
          autoComplete="username"
        />
        {errors.mail?.message !== undefined ? (<Aerror>{errors.mail.message}</Aerror>) : null}
        <Ainput
          type="password"
          registered={register('password', {
            required: t('password.required', { ns: 'fields' })
          })}
          placeholder={t('password.placeholder', { ns: 'fields' })}
          autoComplete="current-password"
        />
        {errors.password?.message !== undefined ? (<Aerror>{errors.password.message}</Aerror>) : null}
        <Aa href="/reset/password">Forgot Password ?</Aa>
        <Button type="submit">
          {t('login.formCTA', { ns: 'pages' })}
        </Button>
      </form>
    </div>
  );
};

export default Login;
