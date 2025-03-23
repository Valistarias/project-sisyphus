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

import CustomEventEmitter from '../utils/eventEmitter';

import type { TypeCampaignEvent } from '../types';

import {
  classTrim,
  type DiceResult,
  throwDices,
  type DiceRequest,
  type UniqueResultDiceData,
} from '../utils';

import './campaignEventWindow.scss';
import { DiceRoller } from '../molecules';

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
  // const { t } = useTranslation();
  const CampaignEvent = useMemo(() => new CustomEventEmitter<CampaignEventDetailData>(), []);

  const [dicesToRoll, setDicesToRoll] = useState<DiceRequest[] | null>(null);

  const [isWindowOpened, setWindowOpened] = useState<boolean>(false);
  // const [isCampaignEventFinished, setRollEventFinished] = useState<boolean>(false);
  const [diceValues, setDiceValues] = useState<UniqueResultDiceData[]>([]);
  const typeRoll = useRef<TypeCampaignEvent>('free');

  // const intervalEvt = useRef<NodeJS.Timeout | null>(null);
  // const endRollEvt = useRef<NodeJS.Timeout | null>(null);
  const rollResults = useRef<DiceResult[] | null>(null);
  // const tick = useRef<number>(0);

  // const cardMode = useMemo(() => {
  //   let diceCount = 0;
  //   dicesToRoll?.forEach(({ qty }) => {
  //     diceCount += qty;
  //   });
  //   if (diceCount === 1) {
  //     return 'single';
  //   }
  //   if (diceCount <= 3) {
  //     return 'large';
  //   }
  //   if (diceCount <= 6) {
  //     return 'medium';
  //   }

  //   return 'small';
  // }, [dicesToRoll]);

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

  const onDiceRollerAnimationEnd = useCallback(() => {
    console.log('Dice Roller Animation End');
    if (typeRoll.current === 'free') {
      setTimeout(() => {
        setWindowOpened(false);
        setTimeout(() => {
          setDiceValues([]);
          typeRoll.current = 'free';
        }, 300);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if (dicesToRoll !== null) {
      // Init
      setWindowOpened(true);
      // setRollEventFinished(false);
      // tick.current = 0;
      rollResults.current = null;
      // CampaignEventing dices
      const totalResult = throwDices(dicesToRoll);
      rollResults.current = totalResult;
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
            ${isWindowOpened ? 'roll-window--open' : ''}
          `)}
      >
        <div
          className="roll-window__shadow"
          // onClick={closeWindow}
        />
        <div className="roll-window__window">
          {diceValues.map((diceValue, position) => (
            <DiceRoller
              key={diceValue.id}
              position={position}
              value={diceValue}
              onAnimationEnd={onDiceRollerAnimationEnd}
              size="xlarge"
            />
          ))}
        </div>
      </div>
      {children}
    </CampaignEventWindowContext.Provider>
  );
};

export const useCampaignEventWindow = (): ICampaignEventWindowContext =>
  useContext(CampaignEventWindowContext);
