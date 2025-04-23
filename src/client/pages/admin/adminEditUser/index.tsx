import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../../providers';

import { getHighestRole } from '../../../../server/utils';
import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Checkbox, Input } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ErrorResponseType, IUser } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditUser.scss';

interface GeneralFormValues {
  username: string;
  charCreationTips: boolean;
  mail: string;
}

interface PasswordFormValues {
  mail: string;
  password: string;
  confirmPassword: string;
}

const AdminEditUser: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [userData, setUserData] = useState<IUser | null>(null);

  const [loading, setLoading] = useState(false);

  const createDefaultGeneralData = useCallback((user: IUser | null) => {
    if (user == null) {
      return {};
    }
    const defaultData: Partial<GeneralFormValues> = {};
    defaultData.username = user.username;
    defaultData.charCreationTips = user.charCreationTips;
    defaultData.mail = user.mail;

    return defaultData;
  }, []);

  const createDefaultPasswordData = useCallback((user: IUser | null) => {
    if (user == null) {
      return {};
    }
    const defaultData: Partial<PasswordFormValues> = {};
    defaultData.mail = user.mail;
    defaultData.password = '';
    defaultData.confirmPassword = '';

    return defaultData;
  }, []);

  const {
    reset: resetGeneral,
    handleSubmit: handleSubmitGeneral,
    control: controlGeneral,
    setError: setErrorGeneral,
    formState: { errors: errorsGeneral },
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultGeneralData(userData),
      [createDefaultGeneralData, userData]
    ),
  });

  const {
    reset: resetPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    control: controlPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultPasswordData(userData),
      [createDefaultPasswordData, userData]
    ),
  });

  const onSubmitGeneral: SubmitHandler<GeneralFormValues> = useCallback(
    ({ username, charCreationTips }) => {
      if (api !== undefined && userData !== null) {
        setLoading(true);
        api.users
          .update({
            id: userData._id,
            username,
            charCreationTips,
          })
          .then((res) => {
            setUserData(res);
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminEditUser.successEdit', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            setLoading(false);
          })
          .catch(({ response }: ErrorResponseType) => {
            const { data } = response;
            console.error(`serverErrors.${data.code}: `, t(`terms.user.${data.sent}`));
          });
      }
    },
    [api, userData, setUserData, getNewId, createAlert, t]
  );

  const onSubmitPassword: SubmitHandler<PasswordFormValues> = useCallback(
    ({ password }) => {
      if (api !== undefined && userData !== null) {
        setLoading(true);
        api.users
          .update({
            id: userData._id,
            password,
          })
          .then((res) => {
            setUserData(res);
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminEditUser.successPassword', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            setLoading(false);
          })
          .catch(({ response }: ErrorResponseType) => {
            const { data } = response;
            console.error(`serverErrors.${data.code}: `, t(`terms.user.${data.sent}`));
          });
      }
    },
    [api, createAlert, getNewId, setUserData, t, userData]
  );

  const userRole = useMemo(() => getHighestRole(userData?.roles ?? []), [userData]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.users
        .get({ userId: id })
        .then((user) => {
          setUserData(user);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, id, t]);

  const onPromote = useCallback(() => {
    if (api === undefined || userData === null) {
      return;
    }
    setLoading(true);
    api.users
      .promote({ userId: userData._id })
      .then((user) => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditUser.successPromote', { ns: 'pages' })}</Ap>
            </Alert>
          ),
        });
        setUserData(user);
        setLoading(false);
      })
      .catch(({ response }: ErrorResponseType) => {
        const { data } = response;
        setErrorGeneral('root.serverError', {
          type: 'server',
          message: t(`serverErrors.${data.code}`),
        });
      });
  }, [api, userData, getNewId, createAlert, t, setErrorGeneral]);

  const onDemote = useCallback(() => {
    if (api === undefined || userData === null) {
      return;
    }
    setLoading(true);
    api.users
      .demote({ userId: userData._id })
      .then((user) => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditUser.successDemote', { ns: 'pages' })}</Ap>
            </Alert>
          ),
        });
        setUserData(user);
        setLoading(false);
      })
      .catch(({ response }: ErrorResponseType) => {
        const { data } = response;
        setErrorGeneral('root.serverError', {
          type: 'server',
          message: t(`serverErrors.${data.code}`),
        });
      });
  }, [api, userData, getNewId, createAlert, t, setErrorGeneral]);

  // To affect default data
  useEffect(() => {
    resetGeneral(createDefaultGeneralData(userData));
    resetPassword(createDefaultPasswordData(userData));
  }, [userData, resetGeneral, createDefaultGeneralData, resetPassword, createDefaultPasswordData]);

  return (
    <div
      className={classTrim(`
        adminEditUser
      `)}
    >
      <div className="adminEditUser__title">
        <div className="adminEditUser__title__text">
          <Atitle className="adminEditUser__title__text__name" level={1}>
            {userData?.mail}
          </Atitle>
          <Ap className="adminEditUser__title__text__role">{t(`terms.role.${userRole}`)}</Ap>
        </div>
        {userRole === 'user' ? (
          <Button onClick={onPromote} disabled={loading}>
            {t('adminEditUser.promote', { ns: 'pages' })}
          </Button>
        ) : null}
        {userRole === 'admin' ? (
          <Button onClick={onDemote} color="error" disabled={loading}>
            {t('adminEditUser.demote', { ns: 'pages' })}
          </Button>
        ) : null}
      </div>
      <Atitle className="adminEditUser__cat" level={2}>
        {t('adminEditUser.general', { ns: 'pages' })}
      </Atitle>
      <form
        className="adminEditUser__form"
        onSubmit={(evt) => {
          void handleSubmitGeneral(onSubmitGeneral)(evt);
        }}
        noValidate
      >
        {errorsGeneral.root?.serverError.message !== undefined ? (
          <Aerror>{errorsGeneral.root.serverError.message}</Aerror>
        ) : null}
        <Input
          control={controlGeneral}
          inputName="mail"
          type="text"
          readOnly
          rules={{ required: t('mail.required', { ns: 'fields' }) }}
          label={t('mail.label', { ns: 'fields' })}
        />
        <Input
          control={controlGeneral}
          inputName="username"
          type="text"
          autoComplete="username"
          rules={{ required: t('username.required', { ns: 'fields' }) }}
          label={t('username.label', { ns: 'fields' })}
        />
        <Checkbox
          inputName="charCreationTips"
          control={controlGeneral}
          label={t('adminEditUser.checkCreationTips', { ns: 'pages' })}
        />
        <Button type="submit" disabled={loading}>
          {t('adminEditUser.cta', { ns: 'pages' })}
        </Button>
      </form>
      <Atitle className="adminEditUser__cat" level={2}>
        {t('adminEditUser.password', { ns: 'pages' })}
      </Atitle>
      <form
        className="adminEditUser__form"
        onSubmit={(evt) => {
          void handleSubmitPassword(onSubmitPassword)(evt);
        }}
        noValidate
      >
        {errorsPassword.root?.serverError.message !== undefined ? (
          <Aerror>{errorsPassword.root.serverError.message}</Aerror>
        ) : null}
        <Input
          control={controlPassword}
          inputName="mail"
          type="email"
          readOnly
          label={t('mail.label', { ns: 'fields' })}
          autoComplete="email"
          className="adminEditUser__form__hidden-mail"
        />
        <Input
          control={controlPassword}
          inputName="password"
          type="password"
          rules={{ required: t('password.required', { ns: 'fields' }) }}
          label={t('newPassword.label', { ns: 'fields' })}
          autoComplete="new-password"
        />
        <Input
          control={controlPassword}
          inputName="confirmPassword"
          type="password"
          rules={{
            required: t('confirmPassword.required', { ns: 'fields' }),
            validate: (val: string) => {
              if (watchPassword('password') !== val) {
                return t('confirmPassword.validate', { ns: 'fields' });
              }
            },
          }}
          label={t('confirmPassword.label', { ns: 'fields' })}
          autoComplete="new-password"
        />
        <Button type="submit" disabled={loading}>
          {t('adminEditUser.cta', { ns: 'pages' })}
        </Button>
      </form>
    </div>
  );
};

export default AdminEditUser;
