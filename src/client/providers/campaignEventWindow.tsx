import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';

import { useTranslation } from 'react-i18next';

import { Aicon, Ap, type typeIcons } from '../atoms';
import { Button, Card, DiceRoller, DiceRollerCharacter, HintButton } from '../molecules';
import { Alert } from '../organisms';
import CustomEventEmitter from '../utils/eventEmitter';

import { useApi } from './api';
import { useGlobalVars } from './globalVars';
import { useSoundSystem } from './soundSystem';
import { useSystemAlerts } from './systemAlerts';

import type { ErrorResponseType, ICard, ICharacter, TypeCampaignEvent } from '../types';

import {
  classTrim,
  type DiceResult,
  throwDices,
  type DiceRequest,
  type UniqueResultDiceData,
} from '../utils';

import './campaignEventWindow.scss';

export interface CampaignEventDetailData {
  result: number;
  formula?: string;
  mode: string;
}

interface ICampaignEventWindowContext {
  /** The function to launch a roll */
  setToRoll: (dices: DiceRequest[], mode: TypeCampaignEvent) => void;
  /** The event listener for when a new campaign event is called from dispatch */
  addCampaignEventListener: (cb: (res: { detail?: CampaignEventDetailData }) => void) => void;
  /** The event listener remover for when a new campaign event is called from dispatch */
  removeCampaignEventListener: (cb: (res: { detail?: CampaignEventDetailData }) => void) => void;
  /** The event listener dispatch */
  dispatchCampaignEvent: (data: { result: number; formula?: string; mode: string }) => void;
}

interface CampaignEventWindowProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode;
}

const CampaignEventWindowContext = React.createContext<ICampaignEventWindowContext>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- To avoid null values
  {} as ICampaignEventWindowContext
);

export const CampaignEventWindowProvider: FC<CampaignEventWindowProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { character, setCharacter } = useGlobalVars();
  const { tone } = useSoundSystem();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const [loading, setLoading] = useState<boolean>(false);

  const CampaignEvent = useMemo(() => new CustomEventEmitter<CampaignEventDetailData>(), []);

  const [mode, setMode] = useState<'dice' | 'sacrifice' | 'addCard' | 'newCard'>('dice');
  const [valueToSacrificeIndex, setValueToSacrificeIndex] = useState<number | null>(null);

  const [dicesToRoll, setDicesToRoll] = useState<DiceRequest[] | null>(null);

  const [newCards, setNewCards] = useState<ICard[]>([]);
  const [cardFlipped, setCardFlipped] = useState<boolean[]>([]);

  const [bonus, setBonus] = useState<string>('00');
  const [displayBonus, setDisplayBonus] = useState<boolean>(false);

  const [total, setTotal] = useState<string>('000');
  const [displayTotal, setDisplayTotal] = useState<boolean>(false);

  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [displayInteractiveButtons, setDisplayInteractiveButtons] = useState<boolean>(false);

  const [isWindowOpened, setWindowOpened] = useState<boolean>(false);
  // const [isCampaignEventFinished, setRollEventFinished] = useState<boolean>(false);
  const [diceValues, setDiceValues] = useState<UniqueResultDiceData[]>([]);
  const typeRoll = useRef<TypeCampaignEvent>('free');

  // const intervalEvt = useRef<NodeJS.Timeout | null>(null);
  // const endRollEvt = useRef<NodeJS.Timeout | null>(null);
  const rollResults = useRef<DiceResult[] | null>(null);
  // const tick = useRef<number>(0);

  const diceRollerMode = useMemo(() => {
    let diceCount = 0;
    dicesToRoll?.forEach(({ qty }) => {
      diceCount += qty;
    });
    if (diceCount === 1) {
      return 'xlarge';
    }
    if (diceCount <= 3) {
      return 'large';
    }
    if (diceCount <= 6) {
      return 'medium';
    }

    return 'small';
  }, [dicesToRoll]);

  // const diceCards = useMemo(() => {
  //   if (diceValues.length === 0) {
  //     return [];
  //   }

  //   return diceValues.map(({ id, type, value }) => (
  //     <DiceCard key={id} type={type} value={value} size={cardMode} />
  //   ));
  // }, [diceValues, cardMode]);

  // const closeWindow = useCallback(() => {
  //   if (isCampaignEventFinished) {
  //     setWindowOpened(false);
  //     tick.current = 0;
  //     if (intervalEvt.current !== null) {
  //       clearTimeout(intervalEvt.current);
  //       intervalEvt.current = null;
  //     }
  //     if (endRollEvt.current !== null) {
  //       clearTimeout(endRollEvt.current);
  //       endRollEvt.current = null;
  //     }
  //     setTimeout(() => {
  //       setDiceValues([]);
  //       typeRoll.current = 'free';
  //     }, 300);
  //   }
  // }, [isCampaignEventFinished]);

  const setToRoll = useCallback((dices: DiceRequest[], mode: TypeCampaignEvent) => {
    setDicesToRoll(dices);
    setIsInteractive(mode.startsWith('skill-') || mode.startsWith('stat-'));
    typeRoll.current = mode;
  }, []);

  const providerValues = useMemo<ICampaignEventWindowContext>(
    () => ({
      setToRoll,
      addCampaignEventListener: (func) => {
        CampaignEvent.addEventListener('addCampaignEvent', func);
      },
      removeCampaignEventListener: (func) => {
        CampaignEvent.removeEventListener('addCampaignEvent', func);
      },
      dispatchCampaignEvent: (data: CampaignEventDetailData) => {
        CampaignEvent.dispatchEvent('addCampaignEvent', data);
      },
    }),
    [setToRoll, CampaignEvent]
  );

  // const affectDiceValueAtIndex = useCallback((curatedDices: DiceData[], index: number) => {
  //   const newCuratedDices = curatedDices.map((curatedDice, indexTab) => ({
  //     ...curatedDice,
  //     value: indexTab <= tick.current ? curatedDice.def : null,
  //   }));
  //   setDiceValues([...newCuratedDices]);
  //   tick.current += 1;
  // }, []);

  // const endRollTriggerEvent = useCallback(() => {
  //   endRollEvt.current = setTimeout(() => {
  //     if (endRollEvt.current !== null && rollResults.current !== null) {
  //       clearTimeout(endRollEvt.current);
  //       endRollEvt.current = null;
  //       setRollEventFinished(true);
  //       CampaignEvent.dispatchEvent('addCampaignEvent', {
  //         result: calculateDices(rollResults.current).total,
  //         formula: diceResultToStr(rollResults.current),
  //         mode: typeRoll.current,
  //       });
  //     }
  //   }, 1000);
  // }, [CampaignEvent]);

  // const totalDom = useMemo(() => {
  //   if (diceCards.length <= 1 || rollResults.current === null) {
  //     return null;
  //   }
  //   const dataDices = calculateDices(rollResults.current);

  //   return (
  //     <div className="roll-window__window__results">
  //       <div className="roll-window__window__results__total">
  //         <Ap className="roll-window__window__results__title">
  //           {t('rollWindow.total', { ns: 'components' })}
  //         </Ap>
  //         <Ap className="roll-window__window__results__value">{dataDices.total.toString()}</Ap>
  //       </div>
  //       {dataDices.best != null && dataDices.worst != null ? (
  //         <>
  //           <div className="roll-window__window__results__line" />
  //           <div className="roll-window__window__results__info">
  //             <div className="roll-window__window__results__info__block">
  //               <Ap className="roll-window__window__results__title">
  //                 {t('rollWindow.best', { ns: 'components' })}
  //               </Ap>
  //               <Ap className="roll-window__window__results__value">{dataDices.best.toString()}</Ap>
  //             </div>
  //             <div className="roll-window__window__results__info__block">
  //               <Ap className="roll-window__window__results__title">
  //                 {t('rollWindow.worst', { ns: 'components' })}
  //               </Ap>
  //               <Ap className="roll-window__window__results__value">
  //                 {dataDices.worst.toString()}
  //               </Ap>
  //             </div>
  //           </div>
  //         </>
  //       ) : null}
  //     </div>
  //   );
  // }, [t]);

  const generateCards = useCallback(
    (cardNumber: number) => {
      if (api !== undefined && character !== false && character?.campaign !== undefined) {
        setLoading(true);
        api.campaigns
          .getCard({ campaignId: character.campaign._id, characterId: character._id, cardNumber })
          .then(({ drawn, addedToPlayer }) => {
            setLoading(false);
            setNewCards(drawn);
            setCardFlipped(() => drawn.map(() => false));
            setMode('newCard');
            if (addedToPlayer) {
              setCharacter((prev: ICharacter) => {
                const next = { ...prev };
                next.hand = next.hand.concat(drawn);

                return next;
              });
            }
          })
          .catch(({ response }: ErrorResponseType) => {
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
    },
    [api, character, getNewId, createAlert, t, setCharacter]
  );

  const closeWindow = useCallback(() => {
    setWindowOpened(false);
    setDisplayBonus(false);
    setDisplayTotal(false);
    setDisplayInteractiveButtons(false);
    setMode('dice');
    setValueToSacrificeIndex(null);
    setTimeout(() => {
      setDiceValues([]);
      setCardFlipped([]);
      typeRoll.current = 'free';
    }, 500);
  }, []);

  const onDiceRollerAnimationEnd = useCallback(() => {
    if (typeRoll.current === 'free') {
      setTimeout(() => {
        closeWindow();
      }, 2000);
    } else {
      setTimeout(() => {
        setDisplayBonus(true);
        setTimeout(() => {
          setDisplayTotal(true);
          if (
            (typeRoll.current.startsWith('skill-') || typeRoll.current.startsWith('stat-')) &&
            character !== false &&
            character?.campaign !== undefined
          ) {
            setTimeout(() => {
              setDisplayInteractiveButtons(true);
            }, 500);
          } else {
            setTimeout(() => {
              closeWindow();
            }, 2000);
          }
        }, 500);
      }, 500);
    }
  }, [closeWindow, character]);

  useEffect(() => {
    if (dicesToRoll !== null) {
      // Init
      setWindowOpened(true);
      rollResults.current = null;

      // CampaignEventing dices
      const totalResult = throwDices(dicesToRoll);
      rollResults.current = totalResult;

      // Only take the first element in consideration for bonuses
      const zeroToBeAddedBonus = totalResult[0].offset.toString().length < 2 ? '0' : '';
      setBonus(zeroToBeAddedBonus + totalResult[0].offset.toString());

      const resultWithZeroes = '000' + totalResult[0].total.toString();
      setTotal(resultWithZeroes.slice(-3));
      // Curating Results and initialize diceValues
      const curatedDices: UniqueResultDiceData[] = [];
      totalResult.forEach((typeDiceRes) => {
        typeDiceRes.results.forEach((diceRes, index) => {
          curatedDices.push({
            id: `${typeDiceRes.type}${index}`,
            type: typeDiceRes.type,
            value: diceRes,
          });
        });
      });
      setDiceValues(curatedDices);
      // // Adding timing here, for beauty purposes
      // setTimeout(() => {
      //   // Affect Dice value instantly, then each timeout event
      //   // as long as necessary
      //   affectDiceValueAtIndex(curatedDices, 0);
      //   if (curatedDices.length > 1) {
      //     intervalEvt.current = setInterval(
      //       () => {
      //         affectDiceValueAtIndex(curatedDices, tick.current);
      //         if (curatedDices.length <= tick.current && intervalEvt.current !== null) {
      //           clearTimeout(intervalEvt.current);
      //           tick.current = 0;
      //           // Last timeout based on animation duration on css
      //           endRollTriggerEvent();
      //         }
      //       },
      //       500 / (curatedDices.length / 2)
      //     );
      //   } else {
      //     // Last timeout based on animation duration on css
      //     endRollTriggerEvent();
      //   }
      // }, 100);
    }
  }, [dicesToRoll]);

  return (
    <CampaignEventWindowContext.Provider value={providerValues}>
      <div
        className={classTrim(`
          roll-window
          roll-window--${diceRollerMode}
          roll-window--mode-${mode}
          ${isWindowOpened ? 'roll-window--open' : ''}
          ${displayBonus ? 'roll-window--bonus' : ''}
          ${displayTotal ? 'roll-window--total' : ''}
          ${displayInteractiveButtons ? 'roll-window--interact' : ''}
        `)}
      >
        <div
          className="roll-window__shadow"
          // onClick={closeWindow}
        />
        <div className="roll-window__window">
          <div className="roll-window__window__new-cards">
            <div className="roll-window__window__new-cards__cards">
              {newCards.map((card, i) => (
                <Card
                  size="large"
                  card={card}
                  flipped={!!cardFlipped[i]}
                  key={i}
                  className="roll-window__window__new-cards__cards__elt"
                  onClick={
                    !cardFlipped[i]
                      ? () => {
                          setCardFlipped((prev) => {
                            const newArr = prev.map((prevBool, index) => {
                              if (i === index && !prevBool) {
                                return !prevBool;
                              } else {
                                return prevBool;
                              }
                            });

                            return newArr;
                          });
                        }
                      : undefined
                  }
                  withInfo
                />
              ))}
            </div>
            <Button
              size="large"
              onClick={closeWindow}
              disabled={cardFlipped.findIndex((elt) => !elt) !== -1}
            >
              {t('rollWindow.done', { ns: 'components' })}
            </Button>
          </div>
          <div className="roll-window__window__dices">
            <div className="roll-window__window__dices__text">
              {t('rollWindow.sacrificeText', { ns: 'components' })}
            </div>
            <div className="roll-window__window__dices__elt">
              {diceValues.map((diceValue, position) => (
                <DiceRoller
                  className="roll-window__window__dices__elt__dice"
                  key={diceValue.id}
                  position={position}
                  value={diceValue}
                  onAnimationEnd={onDiceRollerAnimationEnd}
                  size={diceRollerMode}
                  withIcon
                />
              ))}
              {isInteractive ? (
                <div className="roll-window__window__dices__results">
                  {diceValues.map((diceValue, index) => (
                    <div
                      key={diceValue.id}
                      className={classTrim(`
                      roll-window__window__dices__results__elt
                      ${valueToSacrificeIndex === index ? 'roll-window__window__dices__results__elt--active' : ''}
                    `)}
                      onClick={() => {
                        tone();
                        const resultWithZeroes =
                          '000' +
                          ((rollResults.current?.[0].total ?? 0) - diceValue.value).toString();
                        setTotal(resultWithZeroes.slice(-3));
                        setValueToSacrificeIndex(index);
                      }}
                    >
                      {diceValue.value}
                      <Aicon
                        type={`D${diceValue.type}` as typeIcons}
                        className="roll-window__window__dices__results__elt__icon"
                        size="large"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="roll-window__window__bonuses">
            <Ap className="roll-window__window__bonuses__text">
              {t('rollWindow.bonus', { ns: 'components' })}
            </Ap>
            <div className="roll-window__window__bonuses__total">
              <span className="roll-window__window__bonuses__total__plus">+</span>
              <DiceRollerCharacter
                val={bonus.charAt(0)}
                faded={bonus.startsWith('0')}
                size="large"
              />
              <DiceRollerCharacter val={bonus.charAt(1)} faded={Number(bonus) === 0} size="large" />
            </div>
          </div>
          {isInteractive ? (
            <div className="roll-window__window__total">
              <DiceRollerCharacter
                val={total.charAt(0)}
                faded={total.startsWith('0')}
                size="xlarge"
              />
              <DiceRollerCharacter
                val={total.charAt(1)}
                faded={total.startsWith('00')}
                size="xlarge"
              />
              <DiceRollerCharacter
                val={total.charAt(2)}
                faded={total.startsWith('000')}
                size="xlarge"
              />
            </div>
          ) : null}

          {isInteractive ? (
            <div className="roll-window__window__interactions">
              <div className="interactions-dice">
                <Button size="large" onClick={closeWindow}>
                  {t('rollWindow.done', { ns: 'components' })}
                </Button>
                <HintButton
                  size="large"
                  theme="line"
                  onClick={() => {
                    setMode('sacrifice');
                  }}
                  question={t('rollWindow.sacrificeText', { ns: 'components' })}
                >
                  {t('rollWindow.sacrifice', { ns: 'components' })}
                </HintButton>
              </div>
              <div className="interactions-sacrifice">
                <Button
                  size="large"
                  theme="line"
                  disabled={valueToSacrificeIndex === null || loading}
                  onClick={() => {
                    generateCards(1);
                  }}
                >
                  {t('rollWindow.sacrifice', { ns: 'components' })}
                </Button>
                <Button
                  size="large"
                  disabled={loading}
                  onClick={() => {
                    setMode('dice');
                    setValueToSacrificeIndex(null);
                    const resultWithZeroes =
                      '000' + (rollResults.current?.[0].total ?? 0).toString();
                    setTotal(resultWithZeroes.slice(-3));
                  }}
                >
                  {t('rollWindow.cancel', { ns: 'components' })}
                </Button>
                <HintButton
                  size="large"
                  theme="line"
                  disabled={valueToSacrificeIndex === null || loading}
                  onClick={() => {
                    generateCards(2);
                  }}
                  question={t('rollWindow.oathSacrificeText', { ns: 'components' })}
                >
                  {t('rollWindow.oathSacrifice', { ns: 'components' })}
                </HintButton>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </CampaignEventWindowContext.Provider>
  );
};

export const useCampaignEventWindow = (): ICampaignEventWindowContext =>
  useContext(CampaignEventWindowContext);
