import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, LinkButton, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, basicRichTextElementExtentions } from '../../../organisms';
import { ErrorPage } from '../../index';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICampaign, ICharacter } from '../../../types';

import './editCharacter.scss';

interface FormValues {
  firstName: string;
  lastName: string;
  nickName: string;
  gender: string;
  pronouns: string;
  campaign: string;
}

const EditCharacter: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();
  const { user } = useGlobalVars();
  const { id } = useParams();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [bioText, setBioText] = useState('');

  const bioEditor = useEditor({ extensions: basicRichTextElementExtentions });

  const calledApi = useRef(false);

  const createDefaultData = useCallback((character: ICharacter | null) => {
    if (character == null) {
      return {};
    }
    const defaultData: Partial<FormValues> = {};
    defaultData.firstName = character.firstName;
    defaultData.lastName = character.lastName;
    defaultData.nickName = character.nickName;
    defaultData.gender = character.gender;
    defaultData.pronouns = character.pronouns;
    defaultData.campaign = character.campaign?._id ?? '';

    return defaultData;
  }, []);

  const genderRange = useMemo(
    () => [
      {
        value: 'M',
        label: t('terms.gender.male'),
      },
      {
        value: 'F',
        label: t('terms.gender.female'),
      },
      {
        value: 'N',
        label: t('terms.gender.neutral'),
      },
      {
        value: 'O',
        label: t('terms.gender.other'),
      },
    ],
    [t]
  );

  const {
    reset,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => createDefaultData(character), [createDefaultData, character]),
  });

  const campaignList = useMemo(
    () =>
      campaigns.map(({ _id, name, owner }) => ({
        value: _id,
        label: name,
        details: i18next.format(
          t('terms.general.createdByShort', {
            owner: owner._id === user?._id ? t('terms.general.you') : owner.username,
          }),
          'capitalize'
        ),
      })),
    [campaigns, t, user]
  );

  const getCampaigns = useCallback(() => {
    if (api !== undefined) {
      api.campaigns
        .getAll()
        .then((sentCampaigns) => {
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
    ({ firstName, lastName, nickName, gender, pronouns, campaign }) => {
      if (api !== undefined) {
        api.characters
          .update({
            id,
            firstName,
            lastName,
            nickName,
            gender,
            pronouns,
            campaignId: campaign !== '' ? campaign : undefined,
          })
          .then(() => {
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
    [api, createAlert, getNewId, id, setError, t]
  );

  const onDeleteCharacter = useCallback(() => {
    if (api === undefined || character === null) {
      return;
    }
    let displayedName: string | undefined;
    if (character.nickName !== undefined || character.firstName !== undefined) {
      displayedName = character.nickName ?? `${character.firstName} ${character.lastName}`;
    }
    setConfirmContent(
      {
        title: t('characters.confirmDelete.title', { ns: 'pages' }),
        text: t('characters.confirmDelete.text', {
          ns: 'pages',
          elt: displayedName,
        }),
        confirmCta: t('characters.confirmDelete.confirmCta', { ns: 'pages' }),
        confirmWord: t('terms.general.delete'),
        theme: 'error',
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
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
                void navigate('/characters');
              })
              .catch(({ response }: ErrorResponseType) => {
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
          removeConfirmEventListener(evtId, confirmDelete);
        };
        addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    character,
    setConfirmContent,
    t,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    navigate,
  ]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && id !== undefined) {
      setLoading(true);
      calledApi.current = true;
      getCampaigns();
      api.characters
        .get({ characterId: id })
        .then((sentCharacter) => {
          setCharacter(sentCharacter);
          setBioText(sentCharacter.bio ?? '');
          setLoading(false);
        })
        .catch(({ response }: ErrorResponseType) => {
          if (response.data.code === 'CYPU-104') {
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
      <LinkButton
        className="editcharacter__return-btn"
        href={`/character/${character?._id}`}
        size="small"
      >
        {t('editCharacter.return', { ns: 'pages' })}
      </LinkButton>
      <form
        className="editcharacter__form"
        onSubmit={(evt) => {
          void handleSubmit(onSubmit)(evt);
        }}
        noValidate
      >
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="editcharacter__form__basics">
          <Input
            control={control}
            inputName="firstName"
            type="text"
            autoComplete="username"
            rules={{ required: t('firstName.required', { ns: 'fields' }) }}
            label={t('firstName.label', { ns: 'fields' })}
            className="editcharacter__form__basics__elt"
          />
          <Input
            control={control}
            inputName="lastName"
            type="text"
            autoComplete="username"
            rules={{ required: t('lastName.required', { ns: 'fields' }) }}
            label={t('lastName.label', { ns: 'fields' })}
            className="editcharacter__form__basics__elt"
          />
          <Input
            control={control}
            inputName="nickName"
            type="text"
            autoComplete="username"
            label={t('nickName.label', { ns: 'fields' })}
            className="editcharacter__form__basics__elt"
          />
        </div>
        <div className="editcharacter__form__core">
          <SmartSelect
            control={control}
            inputName="gender"
            label={t('gender.label', { ns: 'fields' })}
            rules={{ required: t('gender.required', { ns: 'fields' }) }}
            options={genderRange}
            className="editcharacter__form__core__elt"
          />
          <Input
            control={control}
            inputName="pronouns"
            type="text"
            label={t('pronouns.label', { ns: 'fields' })}
            className="editcharacter__form__basics__elt"
          />
        </div>
        <div className="adminNewBag__details">
          <RichTextElement
            label={t('bio.title', { ns: 'fields' })}
            editor={bioEditor}
            rawStringContent={bioText}
            small
          />
        </div>
        <Atitle className="editcharacter__form__title" level={2}>
          {t('editCharacter.campaign', { ns: 'pages' })}
        </Atitle>
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
