import React, { useCallback, useContext, useEffect, useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { DiceCard } from '../molecules';

import { classTrim, type DiceRequest } from '../utils';

import './rollWindow.scss';

interface IRollWindowContext {
  /** The function to send all the data to the confirm message element */
  setDicesToRoll: (dices: DiceRequest[]) => void;
}

interface RollWindowProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

const RollWindowContext = React.createContext<IRollWindowContext | null>(null);

export const RollWindowProvider: FC<RollWindowProviderProps> = ({ children }) => {
  const { t } = useTranslation();

  const [dicesToRoll, setDicesToRoll] = useState<DiceRequest[] | null>(null);
  const [isWindowOpened, setWindowOpened] = useState<boolean>(false);

  const closeWindow = useCallback(() => {
    setWindowOpened(false);
    setDicesToRoll(null);
  }, []);

  const providerValues = useMemo(
    () => ({
      setDicesToRoll,
    }),
    [setDicesToRoll]
  );

  useEffect(() => {
    if (dicesToRoll !== null) {
      setWindowOpened(true);
    }
  }, [dicesToRoll]);

  return (
    <RollWindowContext.Provider value={providerValues}>
      <div
        className={classTrim(`
          roll-window
            ${isWindowOpened ? 'roll-window--open' : ''}
          `)}
      >
        <div className="roll-window__shadow" onClick={closeWindow} />
        <div className="roll-window__window">
          <DiceCard type={20} value={12} size="single" />
        </div>
      </div>
      {children}
    </RollWindowContext.Provider>
  );
};

export const useRollWindow = (): IRollWindowContext => {
  return useContext(RollWindowContext) as IRollWindowContext;
};
