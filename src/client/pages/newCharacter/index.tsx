import React, { useCallback, useEffect, useRef, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, SmartSelect, type ISingleValueSelect } from '../../molecules';
import { Alert } from '../../organisms';
import { type ICampaign } from '../../types/data';

import './newCharacter.scss';

interface FormValues {
  name: string;
  campaign: string;
}

const NewCharacter: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<ISingleValueSelect[]>([]);

  const [loading, setLoading] = useState(true);

  const calledApi = useRef(false);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FieldValues>();

  const getCampaigns = useCallback(() => {
    if (api !== undefined) {
      api.campaigns
        .getAll()
        .then((sentCampaigns: ICampaign[]) => {
          setLoading(false);
          // setCampaigns(sentCampaigns);
          setCampaigns(
            sentCampaigns.map(({ _id, name, owner }) => ({
              value: _id,
              label: name,
              details: i18next.format(
                t('terms.general.createdByShort', {
                  owner: owner.username,
                }),
                'capitalize'
              ),
            }))
          );
        })
        .catch(() => {
          setLoading(false);
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
  }, [api, createAlert, getNewId, t]);

  const onSubmit: SubmitHandler<FormValues> = ({ name, campaign }) => {
    if (api !== undefined) {
      api.characters
        .create({
          name,
          campaign,
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

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      getCampaigns();
    }
  }, [api, createAlert, getNewId, getCampaigns, t]);

  // TODO: Add loading state
  if (loading) {
    return null;
  }

  return (
    <div className="newcharacter">
      <Atitle level={1}>{t('newCharacter.title', { ns: 'pages' })}</Atitle>
      <form className="newcharacter__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <Input
          control={control}
          inputName="name"
          type="text"
          rules={{ required: t('characterName.required', { ns: 'fields' }) }}
          label={t('characterName.label', { ns: 'fields' })}
        />
        <SmartSelect
          control={control}
          inputName="campaign"
          label={t('typeRuleBook.select', { ns: 'fields' })}
          options={campaigns}
          className="adminNewRuleBook__basics__type"
        />
        <Button type="submit">{t('newCharacter.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default NewCharacter;
