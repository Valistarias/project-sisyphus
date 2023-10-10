import React, {
  type FC, useState, useMemo, useContext
} from 'react';

interface GlobalVarsContextTypes {
  /** The childrens of the Providers element */
  vars?: Record<string, number>
}

interface GlobalVarsProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element
}

const GlobalVarsContext = React.createContext<GlobalVarsContextTypes | null>(null);

export const GlobalVarsProvider: FC<GlobalVarsProviderProps> = ({ children }) => {
  // Numeral values
  const [vars] = useState<Record<string, number>>({
    nectar: 3,
    flower: 3,
    timeBlock: 3,
    day: 0,
    stepCycle: 3,
    dryadTier: 1,
    tribeTier: 1,
    usedNectar: 0
  });

  const providerValues = useMemo(() => ({
    vars
  }), [
    vars
  ]);

  return (
    <GlobalVarsContext.Provider value={providerValues}>
      {children}
    </GlobalVarsContext.Provider>
  );
};

export const useGlobalVars = (): GlobalVarsContextTypes => {
  return useContext(GlobalVarsContext) as GlobalVarsContextTypes;
};
