import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../providers';

import { ErrorPage } from '..';
import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, SmartSelect } from '../../molecules';
import { Alert } from '../../organisms';
import { type ICampaign, type ICharacter } from '../../types';

import './editCharacter.scss';

interface FormValues {
  name: string;
  campaign: string;
}

const EditCharacter: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { user } = useGlobalVars();
  const { id } = useParams();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const calledApi = useRef(false);

  const createDefaultData = useCallback((character: ICharacter | null) => {
    if (character == null) {
      return {};
    }
    const defaultData: Partial<FormValues> = {};
    defaultData.name = character.name;
    defaultData.campaign = character.campaign?._id ?? '';
    return defaultData;
  }, []);

  const {
    reset,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(character), [createDefaultData, character]),
  });

  const campaignList = useMemo(() => {
    return campaigns.map(({ _id, name, owner }) => ({
      value: _id,
      label: name,
      details: i18next.format(
        t('terms.general.createdByShort', {
          owner: owner._id === user?._id ? t('terms.general.you') : owner.username,
        }),
        'capitalize'
      ),
    }));
  }, [campaigns, t, user]);

  const getCampaigns = useCallback(() => {
    if (api !== undefined) {
      api.campaigns
        .getAll()
        .then((sentCampaigns: ICampaign[]) => {
          setLoading(false);
          setCampaigns(sentCampaigns);
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

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    ({ name, campaign }) => {
      if (api !== undefined) {
        api.characters
          .update({
            id,
            name,
            campaignId: campaign,
          })
          .then(({ characterId }) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('editCharacter.successEdit', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
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
    },
    [api, createAlert, getNewId, id, setError, t]
  );

  const onDeleteCharacter = useCallback(() => {
    if (api === undefined || character === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('characters.confirmDelete.title', { ns: 'pages' }),
        text: t('characters.confirmDelete.text', { ns: 'pages', elt: character.name }),
        confirmCta: t('characters.confirmDelete.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.characters
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('characters.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate('/characters');
              })
              .catch(({ response }) => {
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
          ConfMessageEvent.removeEventListener(evtId, confirmDelete);
        };
        ConfMessageEvent.addEventListener(evtId, confirmDelete);
      }
    );
  }, [api, setConfirmContent, t, character, ConfMessageEvent, id, getNewId, createAlert, navigate]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && id !== undefined) {
      setLoading(true);
      calledApi.current = true;
      getCampaigns();
      api.characters
        .get({
          characterId: id,
        })
        .then((sentCharacter: ICharacter) => {
          if (sentCharacter === undefined) {
            setNotFound(true);
          } else {
            setCharacter(sentCharacter);
          }
          setLoading(false);
        })
        .catch((res) => {
          if (res.response.status === 404) {
            setNotFound(true);
          } else {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              ),
            });
          }
          setLoading(false);
        });
    }
  }, [api, createAlert, getNewId, t, id, getCampaigns]);

  // Default data
  useEffect(() => {
    reset(createDefaultData(character));
  }, [character, reset, createDefaultData]);

  // TODO: Add loading state
  if (loading) {
    return null;
  }

  if (notFound) {
    return <ErrorPage />;
  }

  return (
    <div className="editcharacter">
      <div className="editcharacter__title">
        <Atitle className="editcharacter__title__text" level={1}>
          {t('editCharacter.title', { ns: 'pages' })}
        </Atitle>
        <Button
          theme="text-only"
          color="error"
          onClick={() => {
            onDeleteCharacter();
          }}
        >
          {t('characters.deleteCharacter', { ns: 'pages' })}
        </Button>
      </div>
      <form className="editcharacter__form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          label={t('characterCampaign.label', { ns: 'fields' })}
          options={campaignList}
          className="editcharacter__campaign"
        />
        <Button type="submit">{t('editCharacter.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default EditCharacter;
