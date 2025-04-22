import React, { useCallback, useEffect, useMemo, type FC } from 'react';

import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useApi, useGlobalVars } from '../../../providers';

import { Aerror, Atitle } from '../../../atoms';
import { Button, Checkbox, Input } from '../../../molecules';
import { ErrorPage } from '../../index';

import type { IUser } from '../../../types';

import './editUser.scss';

interface GeneralFormValues {
  username: string;
  charCreationTips: boolean;
  mail: string;
}

interface PasswordFormValues {
  newPass: string;
  confirmNewPass: string;
}

const EditUser: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { user } = useGlobalVars();

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

  const {
    reset: resetGeneral,
    handleSubmit: handleSubmitGeneral,
    setError: setErrorGeneral,
    control: controlGeneral,
    formState: { errors: errorsGeneral },
  } = useForm({
    defaultValues: useMemo(() => createDefaultGeneralData(user), [createDefaultGeneralData, user]),
  });

  const {
    reset: resetPassword,
    handleSubmit: handleSubmitPassword,
    setError: setErrorPassword,
    control: controlPassword,
    formState: { errors: errorsPassword },
  } = useForm();

  const onSubmitGeneral: SubmitHandler<GeneralFormValues> = useCallback(
    ({ username, charCreationTips }) => {
      if (api !== undefined) {
        console.log('username', username);
        console.log('charCreationTips', charCreationTips);
      }
    },
    [api]
  );

  // Default data
  useEffect(() => {
    resetGeneral(createDefaultGeneralData(user));
  }, [user, resetGeneral, createDefaultGeneralData]);

  if (user === null) {
    return <ErrorPage />;
  }

  console.log('user', user);

  return (
    <div className="edituser">
      <div className="edituser__title">
        <Atitle className="edituser__title__text" level={1}>
          {t('editUser.title', { ns: 'pages' })}
        </Atitle>
      </div>
      <Atitle className="edituser__title__text" level={2}>
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
        <div className="edituser__form__basics">
          <Input
            control={controlGeneral}
            inputName="mail"
            type="text"
            readOnly
            rules={{ required: t('mail.required', { ns: 'fields' }) }}
            label={t('mail.label', { ns: 'fields' })}
            className="edituser__form__basics__elt"
          />
          <Input
            control={controlGeneral}
            inputName="username"
            type="text"
            autoComplete="username"
            rules={{ required: t('username.required', { ns: 'fields' }) }}
            label={t('username.label', { ns: 'fields' })}
            className="edituser__form__basics__elt"
          />
          <Checkbox
            inputName="charCreationTips"
            className="edituser__form__basics__elt"
            control={controlGeneral}
            label={t('editUser.checkCreationTips', { ns: 'pages' })}
          />
        </div>
        <Button type="submit">{t('editUser.cta', { ns: 'pages' })}</Button>
      </form>
      <Atitle className="edituser__title__text" level={2}>
        {t('editUser.password', { ns: 'pages' })}
      </Atitle>
    </div>
  );
};

export default EditUser;
