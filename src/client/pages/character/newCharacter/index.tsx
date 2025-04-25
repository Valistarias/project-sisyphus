import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { AnimatePresence } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import tvBackground from '../../../assets/imgs/tvbg2.gif';
import { Aicon, Ap, Atitle } from '../../../atoms';
import { Ariane, Button, Checkbox, type IArianeElt } from '../../../molecules';
import {
  Alert,
  CharCreationStep1,
  CharCreationStep2,
  CharCreationStep3,
  CharCreationStep4,
  CharCreationStep5,
  CharCreationStep6,
  CharCreationStep7,
  RichTextElement,
} from '../../../organisms';

import { introSequence } from './introSequence';

import type {
  ErrorResponseType,
  IBody,
  ICuratedArmor,
  ICuratedBag,
  ICuratedImplant,
  ICuratedItem,
  ICuratedProgram,
  ICuratedWeapon,
} from '../../../types';

import { classTrim } from '../../../utils';

import './newCharacter.scss';

interface ToolTipValues {
  autoDisplay: boolean;
}

const NewCharacter: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { user, setUser, tipTexts, setCharacter, character, resetCharacter, setCharacterFromId } =
    useGlobalVars();
  const { id } = useParams();

  const [displayLoading, setDisplayLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [forcedCharState, setForcedCharState] = useState<number | null>(null);

  const [weapons, setWeapons] = useState<ICuratedWeapon[]>([]);
  const [programs, setPrograms] = useState<ICuratedProgram[]>([]);
  const [items, setItems] = useState<ICuratedItem[]>([]);
  const [implants, setImplants] = useState<ICuratedImplant[]>([]);
  const [bags, setBags] = useState<ICuratedBag[]>([]);
  const [armors, setArmors] = useState<ICuratedArmor[]>([]);

  // 0 -> not began, 1-> is animating, 2-> finished, 3-> hidden
  const [introState, setIntroState] = useState(0);
  const calledApi = useRef(false);

  const { handleSubmit: submitTips, control: toolTipControl } = useForm();

  const charCreationState = useMemo(() => {
    if (id === undefined) {
      // Nothing defined yet
      return 1;
    }
    if (character !== null && character !== false) {
      // if (character.firstName !== undefined) {
      //   return 7;
      // }

      // if (character.money !== undefined && character.money > 0) {
      //   return 6;
      // }

      // if (character.background !== undefined) {
      //   return 5;
      // }

      // if (character.nodes !== undefined && character.nodes.length > 1) {
      //   return 4;
      // }

      // if (character.bodies !== undefined && character.bodies.length > 0) {
      //   return 3;
      // }

      if (character.stats.length === 0) {
        return 2;
      }

      if (character.bodies?.skills.length === 0) {
        return 3;
      }
    }

    return 0;
  }, [character, id]);

  // TODO: Internationalization
  const relevantTipsData = useMemo(() => {
    if (
      user !== null &&
      user.charCreationTips &&
      forcedCharState === null &&
      charCreationState !== 0 &&
      charCreationState !== 7
    ) {
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
    if (api !== undefined) {
      api.weapons
        .getStarters()
        .then((curatedWeapons) => {
          setWeapons(curatedWeapons);
        })
        .catch(() => {
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
      api.programs
        .getStarters()
        .then((curatedPrograms) => {
          setPrograms(curatedPrograms);
        })
        .catch(() => {
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
      api.items
        .getStarters()
        .then((curatedItems) => {
          setItems(curatedItems);
        })
        .catch(() => {
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
      api.implants
        .getStarters()
        .then((curatedImplants) => {
          setImplants(curatedImplants);
        })
        .catch(() => {
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
      api.bags
        .getStarters()
        .then((curatedBags) => {
          setBags(curatedBags);
        })
        .catch(() => {
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
      api.armors
        .getStarters()
        .then((curatedArmors) => {
          setArmors(curatedArmors);
        })
        .catch(() => {
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
  }, [api, getNewId, createAlert, t]);

  const onSubmitCyberFrame = useCallback(
    (cyberFrameId: string) => {
      if (api !== undefined && user !== null) {
        let relevantBody: IBody | undefined = undefined;
        if (character !== false && character?.bodies !== undefined) {
          relevantBody = character.bodies.find((body) => body.alive);
        }

        if (relevantBody === undefined) {
          api.bodies
            .create({
              cyberframeId: cyberFrameId,
              // TODO: add HP HERE
              hp: 40,
            })
            .then((sentCharacterId) => {
              if (character === null || character === false) {
                window.history.replaceState(
                  {},
                  'Sisyphus',
                  `/character/${sentCharacterId}/continue`
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
              setCharacterFromId(sentCharacterId);
            })
            .catch(({ response }: ErrorResponseType) => {
              const { data } = response;
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{data.message}</Ap>
                  </Alert>
                ),
              });
            });
        } else {
          api.bodies
            .update({
              id: relevantBody._id,
              cyberFrameId,
            })
            .then(() => {
              if (character !== false && character !== null) {
                setCharacterFromId(character._id);
              }

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
            .catch(({ response }: ErrorResponseType) => {
              const { data } = response;
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{data.message}</Ap>
                  </Alert>
                ),
              });
            });
        }
      }
    },
    [api, user, character, setCharacterFromId, getNewId, createAlert, t]
  );

  const onSubmitVows = useCallback(
    (backgroundId: string) => {
      if (api !== undefined && user !== null && character !== null && character !== false) {
        // TODO
      }
    },
    [api, character, user]
  );

  const onSubmitItems = useCallback(
    (items: {
      weapons: string[];
      armors: string[];
      bags: string[];
      items: string[];
      programs: string[];
      implants: string[];
      money: number;
    }) => {
      if (
        api !== undefined &&
        user !== null &&
        character !== null &&
        character !== false &&
        character.bodies !== undefined
      ) {
        const relevantBody = character.bodies.find((body) => body.alive);
        if (relevantBody !== undefined) {
          setLoading(true);
          api.bodies
            .resetItems({
              id: relevantBody._id,
              weapons: items.weapons,
              armors: items.armors,
              bags: items.bags,
              items: items.items,
              programs: items.programs,
              implants: items.implants,
            })
            .then(() => {
              api.characters
                .update({
                  id: character._id,
                  money: items.money,
                })
                .then(() => {
                  const newId = getNewId();
                  createAlert({
                    key: newId,
                    dom: (
                      <Alert key={newId} id={newId} timer={5}>
                        <Ap>{t('newCharacter.successUpdateItems', { ns: 'pages' })}</Ap>
                      </Alert>
                    ),
                  });
                  setCharacterFromId(character._id);
                })
                .catch(({ response }: ErrorResponseType) => {
                  const { data } = response;
                  const newId = getNewId();
                  createAlert({
                    key: newId,
                    dom: (
                      <Alert key={newId} id={newId} timer={5}>
                        <Ap>{data.message}</Ap>
                      </Alert>
                    ),
                  });
                });
            })
            .catch(({ response }: ErrorResponseType) => {
              const { data } = response;
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{data.message}</Ap>
                  </Alert>
                ),
              });
            });
        }
      }
    },
    [api, character, createAlert, getNewId, setCharacterFromId, t, user]
  );

  const onSubmitSkills = useCallback(
    (nodeIds: string[]) => {
      if (api !== undefined && user !== null && character !== null && character !== false) {
        let nodeToAdd: string[] = [];
        const nodeToRemove: string[] = [];
        if (character.nodes !== undefined && character.nodes.length > 1) {
          const selectedNodeSkillIds = character.nodes
            .filter(({ node }) => node.skillBranch !== undefined)
            .map(({ node }) => node._id);

          selectedNodeSkillIds.forEach((selectedNodeSkillId) => {
            if (!nodeIds.includes(selectedNodeSkillId)) {
              nodeToRemove.push(selectedNodeSkillId);
            }
          });

          nodeIds.forEach((nodeId) => {
            if (!selectedNodeSkillIds.includes(nodeId)) {
              nodeToAdd.push(nodeId);
            }
          });
        } else {
          nodeToAdd = nodeIds;
        }
        api.characters
          .updateNodes({
            characterId: character._id,
            toAdd: nodeToAdd,
            toRemove: nodeToRemove,
          })
          .then((sentCharacter) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('newCharacter.successUpdateSkills', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            setCharacter(sentCharacter);
          })
          .catch(({ response }: ErrorResponseType) => {
            const { data } = response;
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{data.message}</Ap>
                </Alert>
              ),
            });
          });
      }
    },
    [api, character, createAlert, getNewId, setCharacter, t, user]
  );

  const onSubmitStats = useCallback(
    (
      stats: Array<{
        id: string;
        value: number;
      }>
    ) => {
      if (api !== undefined && user !== null && character !== null && character !== false) {
        api.characters
          .updateStats({
            id: character._id,
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
          .catch(({ response }: ErrorResponseType) => {
            const { data } = response;
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{data.message}</Ap>
                </Alert>
              ),
            });
          });
      }
    },
    [api, user, character, setCharacterFromId, getNewId, createAlert, t]
  );

  const onSubmitIdentification = useCallback(
    ({ firstName, lastName, nickName, gender, pronouns, bio }) => {
      if (api !== undefined && user !== null && character !== null && character !== false) {
        api.characters
          .update({
            id: character._id,
            firstName,
            lastName,
            nickName,
            gender,
            pronouns,
            bio,
            isReady: true,
          })
          .then(() => {
            setCharacterFromId(character._id);
          })
          .catch(({ response }: ErrorResponseType) => {
            const { data } = response;
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{data.message}</Ap>
                </Alert>
              ),
            });
          });
      }
    },
    [api, user, character, getNewId, createAlert, setCharacterFromId]
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
            .catch(({ response }: ErrorResponseType) => {
              const { data } = response;
              console.error(`serverErrors.${data.code}: `, t(`terms.user.${data.sent}`));
            });
        }
      }
    },
    [t, api, setUser, user]
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
    if (charCreationState === 7) {
      return <CharCreationStep7 key="step7" />;
    }

    if (state === 6) {
      return <CharCreationStep6 key="step6" onSubmitIdentification={onSubmitIdentification} />;
    }

    if (state === 5) {
      return (
        <CharCreationStep5
          key="step5"
          loading={loading}
          onSubmitItems={onSubmitItems}
          weapons={weapons}
          programs={programs}
          items={items}
          implants={implants}
          bags={bags}
          armors={armors}
        />
      );
    }

    if (state === 4) {
      return (
        <CharCreationStep4
          key="step4"
          onSubmitVows={onSubmitVows}
          // backgrounds={backgrounds}
        />
      );
    }

    if (state === 3) {
      return <CharCreationStep3 key="step3" onSubmitSkills={onSubmitSkills} />;
    }

    if (state === 2) {
      return <CharCreationStep2 key="step2" onSubmitStats={onSubmitStats} />;
    }

    return <CharCreationStep1 key="step1" onSubmitCyberFrame={onSubmitCyberFrame} />;
  }, [
    forcedCharState,
    charCreationState,
    onSubmitCyberFrame,
    onSubmitIdentification,
    loading,
    onSubmitItems,
    weapons,
    programs,
    items,
    implants,
    bags,
    armors,
    onSubmitVows,
    onSubmitSkills,
    onSubmitStats,
  ]);

  useEffect(() => {
    if (api !== undefined && user !== null && !calledApi.current && id !== undefined) {
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
    } else if (
      (id === undefined || (character !== false && character !== null)) &&
      weapons.length > 0 &&
      programs.length > 0 &&
      implants.length > 0 &&
      items.length > 0 &&
      bags.length > 0 &&
      armors.length > 0
    ) {
      setLoading(false);
      if (id !== undefined && character !== false && character !== null) {
        setDisplayLoading(false);
      }
    }
  }, [
    character,
    weapons,
    id,
    programs.length,
    implants.length,
    items.length,
    bags.length,
    armors.length,
  ]);

  return (
    <div
      className={classTrim(`
        newcharacter
        ${displayLoading ? 'newcharacter--loading' : ''}
        ${introState > 0 ? 'newcharacter--animating' : ''}
        ${introState === 3 ? 'newcharacter--animate-hide' : ''}
        ${tooltipOpen ? 'newcharacter--tooltip' : ''}
        ${id !== undefined ? 'newcharacter--animate-fast' : ''}
        ${charCreationState === 7 || charCreationState === 0 ? 'newcharacter--ending' : ''}
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
            <Aicon className="newcharacter__loading__logo__elt" type="Eidolon" size="unsized" />
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
      <form
        className="newcharacter__tooltip"
        onSubmit={(evt) => {
          void submitTips(onSubmitTooltip)(evt);
        }}
        noValidate
      >
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
        icon={tooltipOpen ? 'Cross' : 'Question'}
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
