import React, { useEffect, useMemo, useRef, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import tvBackground from '../../assets/imgs/tvbg.gif';
import { Aerror, Ap, Avideo } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert } from '../../organisms';
import { type IUser } from '../../types/data';

import { regexMail } from '../../utils';

import './login.scss';

interface FormValues {
  mail: string;
  password: string;
}

const Login: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const { setUser, triggerRuleBookReload } = useGlobalVars();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { createAlert, getNewId } = useSystemAlerts();

  const alertSent = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  useEffect(() => {
    if (params.get('success') === 'true' && !alertSent.current) {
      const newId = getNewId();
      createAlert({
        key: newId,
        dom: (
          <Alert key={newId} id={newId} timer={5}>
            <Ap>{t('login.successRegister', { ns: 'pages' })}</Ap>
          </Alert>
        ),
      });
      alertSent.current = true;
    }
  }, [params, createAlert, getNewId, t]);

  const onSubmit: SubmitHandler<FormValues> = ({ mail, password }) => {
    if (api !== undefined) {
      api.auth
        .signin({
          mail,
          password,
        })
        .then((data: IUser) => {
          setUser(data);
          triggerRuleBookReload();
          navigate('/campaigns');
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-102') {
            setError(data.sent as 'mail' | 'password', {
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
  };

  return (
    <div className="login" style={{ backgroundImage: `url(${tvBackground})` }}>
      <div className="login__main">
        <Avideo video="logo" className="login__main__video" />
        <form className="login__main__form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          <Input
            type="password"
            registered={register('password', {
              required: t('password.required', { ns: 'fields' }),
            })}
            label={t('password.label', { ns: 'fields' })}
            autoComplete="current-password"
          />
          {errors.password?.message !== undefined ? (
            <Aerror>{errors.password.message}</Aerror>
          ) : null}
          <div className="login__main__buttons">
            <Button type="submit">{t('login.formCTA', { ns: 'pages' })}</Button>
            <Button href="/reset/password" theme="text-only">
              {t('login.forgotPass', { ns: 'pages' })}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
