import React, { type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert } from '../../organisms';

import './newCharacter.scss';

interface FormValues {
  name: string;
}

const NewCharacter: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ name }) => {
    if (api !== undefined) {
      api.characters
        .create({
          name,
        })
        .then(({ characterId }) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('newCharacter.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          navigate(`/character/${characterId}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.user.${data.sent}`), 'capitalize'),
            }),
          });
        });
    }
  };

  return (
    <div className="newcharacter">
      <Atitle level={1}>{t('newCharacter.title', { ns: 'pages' })}</Atitle>
      <form className="newcharacter__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <Input
          type="text"
          registered={register('name', {
            required: t('characterName.required', { ns: 'fields' }),
          })}
          label={t('characterName.label', { ns: 'fields' })}
        />
        {errors.name?.message !== undefined ? <Aerror>{errors.name.message}</Aerror> : null}
        <Button type="submit">{t('newCharacter.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default NewCharacter;
