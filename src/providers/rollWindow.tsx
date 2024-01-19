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

import { DiceCard } from '../molecules';

import { type typeDice } from '../interfaces';

import { classTrim, throwDices, type DiceRequest } from '../utils';

import './rollWindow.scss';

interface IRollWindowContext {
  /** The function to send all the data to the confirm message element */
  setDicesToRoll: (dices: DiceRequest[]) => void;
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

const RollWindowContext = React.createContext<IRollWindowContext | null>(null);

export const RollWindowProvider: FC<RollWindowProviderProps> = ({ children }) => {
  const { t } = useTranslation();

  const [dicesToRoll, setDicesToRoll] = useState<DiceRequest[] | null>(null);
  const [isWindowOpened, setWindowOpened] = useState<boolean>(false);

  const [diceValues, setDiceValue] = useState<DiceData[]>([]);

  const intervalEvt = useRef<NodeJS.Timeout | null>(null);
  const tick = useRef<number>(0);

  const cardMode = useMemo(() => {
    let diceCount = 0;
    dicesToRoll?.forEach(({ qty }) => {
      diceCount += qty;
    });
    if (diceCount === 1) {
      return 'single';
    }
    if (diceCount === 2) {
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
    setWindowOpened(false);
    tick.current = 0;
    if (intervalEvt.current !== null) {
      clearTimeout(intervalEvt.current);
    }
    setTimeout(() => {
      setDiceValue([]);
    }, 1000);
  }, []);

  const providerValues = useMemo(
    () => ({
      setDicesToRoll,
    }),
    [setDicesToRoll]
  );

  const affectDiceValueAtIndex = useCallback((curatedDices: DiceData[], index: number) => {
    const newCuratedDices = curatedDices.map((curatedDice, indexTab) => {
      return {
        ...curatedDice,
        value: indexTab <= tick.current ? curatedDice.def : null,
      };
    });
    setDiceValue([...newCuratedDices]);

    tick.current += 1;
    if (curatedDices.length === tick.current && intervalEvt.current !== null) {
      clearTimeout(intervalEvt.current);
      tick.current = 0;
    }
  }, []);

  useEffect(() => {
    if (dicesToRoll !== null) {
      setWindowOpened(true);
      const totalResult = throwDices(dicesToRoll);
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
      setDiceValue(curatedDices);
      // Adding timing here, for beauty purposes
      setTimeout(() => {
        affectDiceValueAtIndex(curatedDices, 0);
        if (curatedDices.length > 1) {
          intervalEvt.current = setInterval(
            () => {
              affectDiceValueAtIndex(curatedDices, tick.current);

              tick.current += 1;
              if (curatedDices.length === tick.current && intervalEvt.current !== null) {
                clearTimeout(intervalEvt.current);
                tick.current = 0;
              }
            },
            1000 / (curatedDices.length / 2)
          );
        }
      }, 100);
    }
  }, [dicesToRoll, affectDiceValueAtIndex]);

  return (
    <RollWindowContext.Provider value={providerValues}>
      <div
        className={classTrim(`
          roll-window
            ${isWindowOpened ? 'roll-window--open' : ''}
          `)}
      >
        <div className="roll-window__shadow" onClick={closeWindow} />
        <div className="roll-window__window">{diceCards}</div>
      </div>
      {children}
    </RollWindowContext.Provider>
  );
};

export const useRollWindow = (): IRollWindowContext => {
  return useContext(RollWindowContext) as IRollWindowContext;
};
