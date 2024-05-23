import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { AnimatePresence } from 'framer-motion';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import tvBackground from '../../../assets/imgs/tvbg2.gif';
import { Aicon, Ap, Atitle } from '../../../atoms';
import { Ariane, Button, Checkbox, type IArianeElt } from '../../../molecules';
import { Alert, CharCreationStep1, CharCreationStep2, RichTextElement } from '../../../organisms';
import { CharCreationStep3 } from '../../../organisms/characterCreation';
import { type ICharacter } from '../../../types';

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
  const {
    user,
    setUser,
    tipTexts,
    cyberFrames,
    setCharacter,
    character,
    resetCharacter,
    setCharacterFromId,
    charParams,
    globalValues,
  } = useGlobalVars();
  const { id } = useParams();

  const [displayLoading, setDisplayLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [forcedCharState, setForcedCharState] = useState<number | null>(null);
  // 0 -> not began, 1-> is animating, 2-> finished, 3-> hidden
  const [introState, setIntroState] = useState(0);
  const calledApi = useRef(false);

  const { handleSubmit: submitTips, control: toolTipControl } = useForm<FieldValues>();

  const charCreationState = useMemo(() => {
    if (character !== null && character !== false) {
      if (character.bodies !== undefined && character.bodies?.length > 0) {
        return 3;
      }

      if (character.nodes !== undefined && character.nodes?.length > 0) {
        return 2;
      }
    }
    // Nothing defined yet
    return 1;
  }, [character]);

  // TODO: Internationalization
  const relevantTipsData = useMemo(() => {
    if (user !== null && user.charCreationTips && forcedCharState === null) {
      setTooltipOpen(true);
    }
    return tipTexts.find(
      ({ tipText }) => tipText.tipId === `tutoChar${forcedCharState ?? charCreationState}`
    );
  }, [charCreationState, forcedCharState, tipTexts, user]);

  const arianeData = useMemo<IArianeElt[]>(
    () =>
      [...Array(6)].map((_, i) => ({
        key: `${i + 1}`,
        label: t(`characterCreation.step${i + 1}.cat`, { ns: 'components' }),
        actual: i + 1 === (forcedCharState ?? charCreationState),
        disabled: i + 1 > charCreationState,
      })),
    [t, charCreationState, forcedCharState]
  );

  const getData = useCallback(() => {
    setIntroState(1);
    setLoading(false);
    if (user !== null) {
      if (user.charCreationTips) {
        setTooltipOpen(true);
      }
    }
  }, [user]);

  const onSubmitCyberFrame = useCallback(
    (cyberFrameId: string) => {
      if (api !== undefined && user !== null) {
        const firstCyberFrameNode = cyberFrames
          .find(({ cyberFrame }) => cyberFrame._id === cyberFrameId)
          ?.cyberFrame.branches.find(
            ({ cyberFrameBranch }) => cyberFrameBranch.title === '_general'
          )?.cyberFrameBranch.nodes[0];
        if (firstCyberFrameNode !== undefined) {
          api.characters
            .addFirstCyberFrameNode({
              characterId: character !== false && character !== null ? character._id : undefined,
              nodeId: firstCyberFrameNode.node._id,
            })
            .then((sentCharacter: ICharacter) => {
              if (character === null || character === false) {
                window.history.replaceState(
                  {},
                  'Sisyphus',
                  `/character/${sentCharacter._id}/continue`
                );
              } else {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('newCharacter.successUpdateCyberFrame', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
              }
              setCharacter(sentCharacter);
            })
            .catch(({ response }) => {
              const { data } = response;
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{data.err.message}</Ap>
                  </Alert>
                ),
              });
            });
        }
      }
    },
    [api, user, cyberFrames, character, setCharacter, getNewId, createAlert, t]
  );

  const onSubmitSkills = useCallback((skills: string[]) => {
    console.log('skills', skills);
  }, []);

  const onSubmitStats = useCallback(
    (
      stats: Array<{
        id: string;
        value: number;
      }>
    ) => {
      if (api !== undefined && user !== null && character !== null && character !== false) {
        if (character.bodies !== undefined) {
          const relevantBody = character.bodies?.find((body) => body.alive);
          if (relevantBody !== undefined) {
            api.bodies
              .updateStats({
                id: relevantBody._id,
                stats,
              })
              .then(() => {
                setCharacterFromId(character._id);
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('newCharacter.successUpdateStats', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
              })
              .catch(({ response }) => {
                const { data } = response;
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{data.err.message}</Ap>
                    </Alert>
                  ),
                });
              });
          }
        } else {
          let hpVal = Number(globalValues.find(({ name }) => name === 'startHp')?.value ?? 0);
          const idHpCharParam = charParams.find(({ charParam }) => charParam.formulaId === 'hp')
            ?.charParam._id;
          character.nodes?.forEach(({ node }) => {
            node.charParamBonuses?.forEach((charParamBonus) => {
              if (charParamBonus.charParam === idHpCharParam) {
                hpVal += charParamBonus.value;
              }
            });
          });
          api.bodies
            .create({
              characterId: character._id,
              hp: hpVal,
              stats,
            })
            .then(() => {
              setCharacterFromId(character._id);
            })
            .catch(({ response }) => {
              const { data } = response;
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{data.err.message}</Ap>
                  </Alert>
                ),
              });
            });
        }
      }
    },
    [api, user, character, setCharacterFromId, getNewId, createAlert, t, globalValues, charParams]
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

  const onArianeClick = useCallback(
    (elt: number) => {
      if (elt === charCreationState) {
        setForcedCharState(null);
      } else {
        setForcedCharState(Number(elt));
      }
    },
    [charCreationState]
  );

  const actualFormContent = useMemo(() => {
    const state = forcedCharState ?? charCreationState;
    if (state === 3) {
      return <CharCreationStep3 key="step3" onSubmitSkills={onSubmitSkills} />;
    }

    if (state === 2) {
      return <CharCreationStep2 key="step2" onSubmitStats={onSubmitStats} />;
    }
    return <CharCreationStep1 key="step1" onSubmitCyberFrame={onSubmitCyberFrame} />;
  }, [forcedCharState, charCreationState, onSubmitCyberFrame, onSubmitSkills, onSubmitStats]);

  useEffect(() => {
    if (
      setCharacterFromId !== undefined &&
      api !== undefined &&
      user !== null &&
      !calledApi.current &&
      id !== undefined
    ) {
      setLoading(true);
      setCharacterFromId(id);
      calledApi.current = true;
      getData();
    } else if (id === undefined && api !== undefined && user !== null && !calledApi.current) {
      calledApi.current = true;
      getData();
    }

    return () => {
      resetCharacter();
    };
  }, [api, user, createAlert, getNewId, getData, t, id, resetCharacter, setCharacterFromId]);

  useEffect(() => {
    if (!loading && introState === 2 && id === undefined) {
      setTimeout(() => {
        setDisplayLoading(false);
        setTimeout(() => {
          setIntroState(3);
        }, 1100);
      }, 2000);
    }
  }, [loading, introState, id]);

  useEffect(() => {
    if ((character === false || character === null) && id !== undefined) {
      setLoading(true);
    } else if (character !== false && character !== null && id !== undefined) {
      setLoading(false);
      setDisplayLoading(false);
    }
  }, [character, id]);

  return (
    <div
      className={classTrim(`
        newcharacter
        ${displayLoading ? 'newcharacter--loading' : ''}
        ${introState > 0 ? 'newcharacter--animating' : ''}
        ${introState === 3 ? 'newcharacter--animate-hide' : ''}
        ${tooltipOpen ? 'newcharacter--tooltip' : ''}
        ${id !== undefined ? 'newcharacter--animate-fast' : ''}
      `)}
    >
      <div
        className="newcharacter__loading"
        style={id === undefined ? { backgroundImage: `url(${tvBackground})` } : {}}
      >
        <div
          className="newcharacter__loading__accent"
          style={id === undefined ? { backgroundImage: `url(${tvBackground})` } : {}}
        />
        <div className="newcharacter__loading__main-block">
          {!loading && id === undefined ? (
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
          {id === undefined ? (
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
          ) : null}
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
      <AnimatePresence mode="wait">{actualFormContent}</AnimatePresence>
    </div>
  );
};

export default NewCharacter;
