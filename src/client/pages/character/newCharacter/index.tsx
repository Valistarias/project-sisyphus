import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TypeAnimation } from 'react-type-animation';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import tvBackground from '../../../assets/imgs/tvbg2.gif';
import { Aicon, Ap, Atitle } from '../../../atoms';
import { Ariane, Button, Checkbox, type IArianeElt } from '../../../molecules';
import { Alert, CharCreationStep1, RichTextElement } from '../../../organisms';

import { introSequence } from './introSequence';

import { classTrim } from '../../../utils';

import './newCharacter.scss';

interface ToolTipValues {
  autoDisplay: boolean;
}

const NewCharacter: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { user, setUser, tipTexts, cyberFrames, setCharacter, character } = useGlobalVars();

  const [displayLoading, setDisplayLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  // 0 -> not began, 1-> is animating, 2-> finished, 3-> hidden
  const [introState, setIntroState] = useState(0);
  const calledApi = useRef(false);

  const { handleSubmit: submitTips, control: toolTipControl } = useForm<FieldValues>();

  const charCreationState = useMemo(() => {
    if (character !== null && character !== false) {
      if (character.nodes !== undefined && character.nodes?.length > 0) {
        return 2;
      }
    }
    // Nothing defined yet
    return 1;
  }, [character]);

  // TODO: Internationalization
  const relevantTipsData = useMemo(() => {
    if (user !== null && user.charCreationTips) {
      setTooltipOpen(true);
    }
    return tipTexts.find(({ tipText }) => tipText.tipId === `tutoChar${charCreationState}`);
  }, [charCreationState, tipTexts, user]);

  const arianeData = useMemo<IArianeElt[]>(
    () =>
      [...Array(6)].map((_, i) => ({
        key: `${i + 1}`,
        label: t(`characterCreation.step${i + 1}.cat`, { ns: 'components' }),
        actual: i + 1 === charCreationState,
        disabled: i + 1 > charCreationState,
      })),
    [t, charCreationState]
  );

  const getData = useCallback(() => {
    setIntroState(1);
    if (api !== undefined) {
      // When data finished loading
      setLoading(false);
    }
    if (user !== null) {
      if (user.charCreationTips) {
        setTooltipOpen(true);
      }
    }
  }, [api, user]);

  const onSubmitCyberFrame = useCallback(
    (id: string) => {
      if (api !== undefined && user !== null) {
        const firstCyberFrameNode = cyberFrames
          .find(({ cyberFrame }) => cyberFrame._id === id)
          ?.cyberFrame.branches.find(
            ({ cyberFrameBranch }) => cyberFrameBranch.title === '_general'
          )?.cyberFrameBranch.nodes[0];
        if (firstCyberFrameNode !== undefined) {
          api.characters
            .addNode({
              nodeId: firstCyberFrameNode.node._id,
            })
            .then((character) => {
              setCharacter(character);
            })
            .catch(({ response }) => {
              const { data } = response;
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{data}</Ap>
                  </Alert>
                ),
              });
            });
        }
      }
    },
    [api, createAlert, cyberFrames, getNewId, setCharacter, user]
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

  const onArianeClick = useCallback((elt) => {
    console.log('elt', elt);
  }, []);

  const actualFormContent = useMemo(() => {
    return <CharCreationStep1 onSubmitCyberFrame={onSubmitCyberFrame} />;
  }, [onSubmitCyberFrame]);

  useEffect(() => {
    if (api !== undefined && user !== null && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      getData();
    }
  }, [api, user, createAlert, getNewId, getData, t]);

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
      <Ariane isSteps data={arianeData} onArianeClick={onArianeClick} />
      {actualFormContent}
    </div>
  );
};

export default NewCharacter;
