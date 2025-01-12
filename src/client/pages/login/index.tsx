import React, { useCallback, useEffect, useMemo, useRef, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import tvBackground from '../../assets/imgs/tvbg2.gif';
import { Aerror, Ap, Avideo } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert } from '../../organisms';
import { type IUser } from '../../types';

import { regexMail } from '../../utils';

import './login.scss';

interface FormValues {
  mail: string;
  password: string;
}

const Login: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const { setUser, reloadAll } = useGlobalVars();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { createAlert, getNewId } = useSystemAlerts();

  const alertSent = useRef(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FieldValues>();

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

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    ({ mail, password }) => {
      if (api !== undefined) {
        api.auth
          .signin({
            mail,
            password,
          })
          .then((data: IUser) => {
            setUser(data);
            reloadAll();
            // triggerRuleBookReload();
            void navigate('/campaigns');
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
    },
    [api, navigate, setError, setUser, t, reloadAll]
  );

  return (
    <div className="login" style={{ backgroundImage: `url(${tvBackground})` }}>
      <div className="login__main">
        <Avideo video="logo" className="login__main__video" />
        <form className="login__main__form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {errors.root?.serverError?.message !== undefined ? (
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
          <Input
            control={control}
            inputName="password"
            type="password"
            rules={{
              required: t('password.required', { ns: 'fields' }),
            }}
            label={t('password.label', { ns: 'fields' })}
            autoComplete="current-password"
          />
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
