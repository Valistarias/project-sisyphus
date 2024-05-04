import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import tvBackground from '../../../assets/imgs/tvbg.gif';
import { Aerror, Aicon, Ap, Atitle } from '../../../atoms';
import { Button, Checkbox, Input, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement } from '../../../organisms';

import { introSequence } from './introSequence';

import { classTrim } from '../../../utils';

import './newCharacter.scss';

interface FormValues {
  name: string;
  campaign: string;
}

interface ToolTipValues {
  autoDisplay: boolean;
}

const NewCharacter: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { user, setUser, campaigns, tipTexts } = useGlobalVars();
  const navigate = useNavigate();

  const [displayLoading, setDisplayLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(true);
  // 0 -> not began, 1-> is animating, 2-> finished, 3-> hidden
  const [introState, setIntroState] = useState(0);
  const calledApi = useRef(false);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FieldValues>();

  const { handleSubmit: submitTips, control: toolTipControl } = useForm<FieldValues>();

  const charCreationState = useMemo(() => {
    // Nothing defined yet
    return 1;
  }, []);

  // TODO: Internationalization
  const relevantTipsData = useMemo(
    () => tipTexts.find(({ tipText }) => tipText.tipId === `tutoChar${charCreationState}`),
    [charCreationState, tipTexts]
  );

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

  const getData = useCallback(() => {
    setIntroState(1);
    if (api !== undefined) {
      // When data finished loading
      setLoading(false);
    }
  }, [api]);

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    ({ name, campaign }) => {
      if (api !== undefined) {
        api.characters
          .create({
            name,
            campaignId: campaign,
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
    },
    [api, createAlert, getNewId, navigate, setError, t]
  );

  const onSubmitTooltip: SubmitHandler<ToolTipValues> = useCallback(
    ({ autoDisplay }) => {
      if (api !== undefined && user !== null) {
        setTooltipOpen(false);
        if (autoDisplay && user.charCreationTips) {
          api.users
            .update({
              id: user._id,
              charCreationTips: false,
            })
            .then((res) => {
              setUser(res);
            })
            .catch(() => {});
        }
      }
    },
    [api, setUser, user]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      getData();
    }
  }, [api, createAlert, getNewId, getData, t]);

  useEffect(() => {
    if (!loading && introState === 2) {
      setTimeout(() => {
        setDisplayLoading(false);
        setTimeout(() => {
          setIntroState(3);
        }, 1100);
      }, 2000);
    }
  }, [loading, introState]);

  // TODO: Add loading state
  // if (loading) {
  //   return null;
  // }

  return (
    <div
      className={classTrim(`
        newcharacter
        ${displayLoading ? 'newcharacter--loading' : ''}
        ${introState > 0 ? 'newcharacter--animating' : ''}
        ${introState === 3 ? 'newcharacter--animate-hide' : ''}
        ${tooltipOpen ? 'newcharacter--tooltip' : ''}
      `)}
    >
      <div className="newcharacter__loading" style={{ backgroundImage: `url(${tvBackground})` }}>
        <div
          className="newcharacter__loading__accent"
          style={{ backgroundImage: `url(${tvBackground})` }}
        />
        <div className="newcharacter__loading__main-block">
          {!loading ? (
            <div className="newcharacter__loading__skip">
              <Button
                size="large"
                onClick={() => {
                  setDisplayLoading(false);
                }}
              >
                {t('newCharacter.skipIntro', { ns: 'pages' })}
              </Button>
            </div>
          ) : null}
          <div className="newcharacter__loading__logo">
            <Aicon className="newcharacter__loading__logo__elt" type="eidolon" size="unsized" />
          </div>
          <div className="newcharacter__loading__code">
            <Ap>
              <TypeAnimation
                className="newcharacter__loading__code__elt"
                sequence={[
                  ...introSequence(),
                  () => {
                    setIntroState(2);
                  },
                ]}
                speed={94}
                cursor={false}
                omitDeletionAnimation={true}
                style={{ whiteSpace: 'pre-line' }}
              />
            </Ap>
          </div>
        </div>
      </div>
      <form className="newcharacter__tooltip" onSubmit={submitTips(onSubmitTooltip)} noValidate>
        <div className="newcharacter__tooltip__shell">
          <div className="newcharacter__tooltip__core">
            <Atitle className="newcharacter__tooltip__core__title">
              {relevantTipsData?.tipText.title}
            </Atitle>
            <RichTextElement
              className="newcharacter__tooltip__core__text"
              rawStringContent={relevantTipsData?.tipText.summary}
              readOnly
            />
            <div className="newcharacter__tooltip__buttons">
              <Button type="submit" size="large">
                {t('newCharacter.closeTip', { ns: 'pages' })}
              </Button>
            </div>
          </div>
          {user?.charCreationTips === true ? (
            <Checkbox
              inputName="autoDisplay"
              label={t('newCharacter.checkCloseTip', { ns: 'pages' })}
              control={toolTipControl}
            />
          ) : null}
        </div>
      </form>
      <Button
        size="large"
        icon={tooltipOpen ? 'cross' : 'question'}
        theme="afterglow"
        className="newcharacter__tooltip-btn"
        onClick={() => {
          setTooltipOpen((prev) => !prev);
        }}
      />
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
          label={t('characterCampaign.label', { ns: 'fields' })}
          options={campaignList}
          className="newcharacter__campaign"
        />
        <Button type="submit">{t('newCharacter.formCTA', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default NewCharacter;
