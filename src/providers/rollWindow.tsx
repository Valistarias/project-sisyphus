import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';

import { useTranslation } from 'react-i18next';

import { Ap } from '../atoms';
import { Button, DiceCard } from '../molecules';

import { type typeDice } from '../interfaces';

import { calculateDices, classTrim, throwDices, type DiceRequest, type DiceResult } from '../utils';

import './rollWindow.scss';

interface IRollWindowContext {
  /** The function to send all the data to the confirm message element */
  setDicesToRoll: (dices: DiceRequest[]) => void;
  /** The event system linked to the confirm popup */
  addRollEventListener: (id: string, cb: (data: any) => void) => void;
  removeRollEventListener: (id: string, cb: (data: any) => void) => void;
}

interface RollWindowProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

interface DiceData {
  /** The ID of the dice element */
  id: string;
  /** The type of dice */
  type: typeDice;
  /** The changed value over time */
  value: number | null;
  /** The definitive value, to be used with timeout */
  def: number;
}

function Emitter(): void {
  const eventTarget = document.createDocumentFragment();

  function delegate(method: string): void {
    this[method] = eventTarget[method].bind(eventTarget);
  }

  Emitter.methods.forEach(delegate, this);
}

function RollEventEmitter(): void {
  Emitter.call(this);
}

Emitter.methods = ['addEventListener', 'dispatchEvent', 'removeEventListener'];

const RollWindowContext = React.createContext<IRollWindowContext | null>(null);

export const RollWindowProvider: FC<RollWindowProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const RollEvent = useMemo(() => new RollEventEmitter(), []);

  const [dicesToRoll, setDicesToRoll] = useState<DiceRequest[] | null>(null);

  const [isWindowOpened, setWindowOpened] = useState<boolean>(false);
  const [isRollFinished, setRollFinished] = useState<boolean>(false);
  const [diceValues, setDiceValues] = useState<DiceData[]>([]);

  const intervalEvt = useRef<NodeJS.Timeout | null>(null);
  const endRollEvt = useRef<NodeJS.Timeout | null>(null);
  const rollResults = useRef<DiceResult[] | null>(null);
  const tick = useRef<number>(0);

  const cardMode = useMemo(() => {
    let diceCount = 0;
    dicesToRoll?.forEach(({ qty }) => {
      diceCount += qty;
    });
    if (diceCount === 1) {
      return 'single';
    }
    if (diceCount <= 3) {
      return 'large';
    }
    if (diceCount <= 6) {
      return 'medium';
    }
    return 'small';
  }, [dicesToRoll]);

  const diceCards = useMemo(() => {
    if (diceValues === null) {
      return null;
    }
    return diceValues.map(({ id, type, value }) => (
      <DiceCard key={id} type={type as typeDice} value={value} size={cardMode} />
    ));
  }, [diceValues, cardMode]);

  const closeWindow = useCallback(() => {
    if (isRollFinished) {
      setWindowOpened(false);
      tick.current = 0;
      if (intervalEvt.current !== null) {
        clearTimeout(intervalEvt.current);
        intervalEvt.current = null;
      }
      if (endRollEvt.current !== null) {
        clearTimeout(endRollEvt.current);
        endRollEvt.current = null;
      }
      setTimeout(() => {
        setDiceValues([]);
      }, 300);
    }
  }, [isRollFinished]);

  const providerValues = useMemo<IRollWindowContext>(
    () => ({
      setDicesToRoll,
      addRollEventListener: RollEvent.addEventListener,
      removeRollEventListener: RollEvent.removeEventListener,
    }),
    [setDicesToRoll, RollEvent]
  );

  const affectDiceValueAtIndex = useCallback((curatedDices: DiceData[], index: number) => {
    const newCuratedDices = curatedDices.map((curatedDice, indexTab) => {
      return {
        ...curatedDice,
        value: indexTab <= tick.current ? curatedDice.def : null,
      };
    });
    setDiceValues([...newCuratedDices]);
    tick.current += 1;
  }, []);

  const endRollTriggerEvent = useCallback(() => {
    endRollEvt.current = setTimeout(() => {
      if (endRollEvt.current !== null) {
        clearTimeout(endRollEvt.current);
        endRollEvt.current = null;
        setRollFinished(true);
        RollEvent.dispatchEvent(
          new CustomEvent('endroll', {
            detail: {
              stats: rollResults.current,
            },
          })
        );
      }
    }, 1000);
  }, [RollEvent, rollResults]);

  const totalDom = useMemo(() => {
    if (diceCards == null || diceCards.length === 1 || rollResults.current === null) {
      return null;
    }
    const dataDices = calculateDices(rollResults.current);

    return (
      <div className="roll-window__window__results">
        <div className="roll-window__window__results__total">
          <Ap className="roll-window__window__results__title">
            {t('rollWindow.total', { ns: 'components' })}
          </Ap>
          <Ap className="roll-window__window__results__value">{dataDices.total.toString()}</Ap>
        </div>
        {dataDices.best != null && dataDices.worst != null ? (
          <>
            <div className="roll-window__window__results__line" />
            <div className="roll-window__window__results__info">
              <div className="roll-window__window__results__info__block">
                <Ap className="roll-window__window__results__title">
                  {t('rollWindow.best', { ns: 'components' })}
                </Ap>
                <Ap className="roll-window__window__results__value">{dataDices.best.toString()}</Ap>
              </div>
              <div className="roll-window__window__results__info__block">
                <Ap className="roll-window__window__results__title">
                  {t('rollWindow.worst', { ns: 'components' })}
                </Ap>
                <Ap className="roll-window__window__results__value">
                  {dataDices.worst.toString()}
                </Ap>
              </div>
            </div>
          </>
        ) : null}
      </div>
    );
  }, [diceCards, t]);

  useEffect(() => {
    if (dicesToRoll !== null) {
      // Init
      setWindowOpened(true);
      setRollFinished(false);
      tick.current = 0;
      rollResults.current = null;
      // Rolling dices
      const totalResult = throwDices(dicesToRoll);
      rollResults.current = totalResult;
      // Curating Results and initialize diceValues
      const curatedDices: DiceData[] = [];
      totalResult.forEach((typeDiceRes) => {
        typeDiceRes.results.forEach((diceRes, index) => {
          curatedDices.push({
            id: `${typeDiceRes.type}${index}`,
            type: typeDiceRes.type,
            value: null,
            def: diceRes,
          });
        });
      });
      setDiceValues(curatedDices);
      // Adding timing here, for beauty purposes
      setTimeout(() => {
        // Affect Dice value instantly, then each timeout event
        // as long as necessary
        affectDiceValueAtIndex(curatedDices, 0);
        if (curatedDices.length > 1) {
          intervalEvt.current = setInterval(
            () => {
              affectDiceValueAtIndex(curatedDices, tick.current);
              if (curatedDices.length <= tick.current && intervalEvt.current !== null) {
                clearTimeout(intervalEvt.current);
                tick.current = 0;
                // Last timeout based on animation duration on css
                endRollTriggerEvent();
              }
            },
            500 / (curatedDices.length / 2)
          );
        } else {
          // Last timeout based on animation duration on css
          endRollTriggerEvent();
        }
      }, 100);
    }
  }, [dicesToRoll, affectDiceValueAtIndex, endRollTriggerEvent]);

  return (
    <RollWindowContext.Provider value={providerValues}>
      <div
        className={classTrim(`
          roll-window
            ${isWindowOpened ? 'roll-window--open' : ''}
            ${isRollFinished ? 'roll-window--end' : ''}
            roll-window--card-${cardMode}
            ${diceValues.length > 15 ? 'roll-window--safe-mode' : ''}
          `)}
      >
        <div className="roll-window__shadow" onClick={closeWindow} />
        <div className="roll-window__window">
          <div className="roll-window__window__content">
            <div className="roll-window__window__values">{diceCards}</div>
            {totalDom}
          </div>
          <Button
            className="roll-window__window__close"
            size="large"
            theme="afterglow"
            onClick={closeWindow}
            disabled={!isRollFinished}
          >
            {t('rollWindow.close', { ns: 'components' })}
          </Button>
        </div>
      </div>
      {children}
    </RollWindowContext.Provider>
  );
};

export const useRollWindow = (): IRollWindowContext => {
  return useContext(RollWindowContext) as IRollWindowContext;
};
