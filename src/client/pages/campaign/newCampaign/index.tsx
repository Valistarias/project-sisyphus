import React, { useCallback, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert } from '../../../organisms';

import './newCampaign.scss';
import type { ErrorResponseType } from '../../../types';

interface FormValues {
  name: string;
}

const NewCampaign: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    ({ name }) => {
      if (api !== undefined) {
        api.campaigns
          .create({ name })
          .then(({ _id }) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('newCampaign.successCreate', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            void navigate(`/campaign/${_id}`);
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
    <div className="newcampaign">
      <Atitle level={1}>{t('newCampaign.title', { ns: 'pages' })}</Atitle>
      <form
        className="newcampaign__form"
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
          inputName="campaignName"
          type="text"
          rules={{ required: t('campaignName.required', { ns: 'fields' }) }}
          label={t('campaignName.label', { ns: 'fields' })}
        />
        <Button type="submit">{t('newCampaign.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default NewCampaign;
