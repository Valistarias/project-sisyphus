import React, { useCallback, useEffect, useMemo, useState, type FC } from 'react';

import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Checkbox, Input } from '../../../molecules';
import { Alert } from '../../../organisms';
import { ErrorPage } from '../../index';

import type { ErrorResponseType, IUser } from '../../../types';

import './editUser.scss';

interface GeneralFormValues {
  username: string;
  charCreationTips: boolean;
  mail: string;
}

interface PasswordFormValues {
  mail: string;
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

const EditUser: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { user, setUser } = useGlobalVars();

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
    defaultData.oldPassword = '';
    defaultData.password = '';
    defaultData.confirmPassword = '';

    return defaultData;
  }, []);

  const {
    reset: resetGeneral,
    handleSubmit: handleSubmitGeneral,
    control: controlGeneral,
    formState: { errors: errorsGeneral },
  } = useForm({
    defaultValues: useMemo(() => createDefaultGeneralData(user), [createDefaultGeneralData, user]),
  });

  const {
    reset: resetPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    control: controlPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultPasswordData(user),
      [createDefaultPasswordData, user]
    ),
  });

  const onSubmitGeneral: SubmitHandler<GeneralFormValues> = useCallback(
    ({ username, charCreationTips }) => {
      if (api !== undefined && user !== null) {
        setLoading(true);
        api.users
          .update({
            id: user._id,
            username,
            charCreationTips,
          })
          .then((res) => {
            setUser(res);
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('editUser.successEdit', { ns: 'pages' })}</Ap>
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
    [api, user, setUser, getNewId, createAlert, t]
  );

  const onSubmitPassword: SubmitHandler<PasswordFormValues> = useCallback(
    ({ password, oldPassword }) => {
      if (api !== undefined && user !== null) {
        setLoading(true);
        api.users
          .update({
            id: user._id,
            password,
            oldPassword,
          })
          .then((res) => {
            setUser(res);
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('editUser.successPassword', { ns: 'pages' })}</Ap>
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
    [api, createAlert, getNewId, setUser, t, user]
  );

  // Default data
  useEffect(() => {
    resetGeneral(createDefaultGeneralData(user));
    resetPassword(createDefaultPasswordData(user));
  }, [user, resetGeneral, createDefaultGeneralData, resetPassword, createDefaultPasswordData]);

  if (user === null) {
    return <ErrorPage />;
  }

  return (
    <div className="edituser">
      <div className="edituser__title">
        <Atitle className="edituser__title__text" level={1}>
          {t('editUser.title', { ns: 'pages' })}
        </Atitle>
      </div>
      <Atitle className="edituser__cat" level={2}>
        {t('editUser.general', { ns: 'pages' })}
      </Atitle>
      <form
        className="edituser__form"
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
          label={t('editUser.checkCreationTips', { ns: 'pages' })}
        />
        <Button type="submit" disabled={loading}>
          {t('editUser.cta', { ns: 'pages' })}
        </Button>
      </form>
      <Atitle className="edituser__cat" level={2}>
        {t('editUser.password', { ns: 'pages' })}
      </Atitle>
      <form
        className="edituser__form"
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
          className="edituser__form__hidden-mail"
        />
        <Input
          control={controlPassword}
          inputName="oldPassword"
          type="password"
          rules={{ required: t('password.required', { ns: 'fields' }) }}
          label={t('oldPassword.label', { ns: 'fields' })}
          autoComplete="current-password"
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
          {t('editUser.cta', { ns: 'pages' })}
        </Button>
      </form>
    </div>
  );
};

export default EditUser;
