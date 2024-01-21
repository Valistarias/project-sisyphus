import React, { type FC, useState, useMemo, useContext, useEffect } from 'react';

import { useGlobalVars } from './globalVars';

interface IThemeContext {
  /** The chosen theme */
  colorMode: string;
}

interface ThemeProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

const ThemeContext = React.createContext<IThemeContext | null>(null);

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [colorMode] = useState('dark');

  const { user } = useGlobalVars();

  const chosenTheme = useMemo(() => {
    if (user?.theme === undefined) {
      return 'dark-theme';
    }
    return `${user.theme}-theme`;
  }, [user]);

  const chosenScale = useMemo(() => {
    if (user?.scale === undefined) {
      return 100;
    }
    return user.scale * 100;
  }, [user]);

  useEffect(() => {
    const htmlDomElt = document.querySelector('html');
    if (htmlDomElt !== null) {
      switch (chosenScale) {
        case 80: {
          htmlDomElt.style.fontSize = '50%';
          break;
        }
        case 120: {
          htmlDomElt.style.fontSize = '75%';
          break;
        }
        case 140: {
          htmlDomElt.style.fontSize = '87.5%';
          break;
        }
        default: {
          htmlDomElt.style.fontSize = '62.5%';
        }
      }
    }
  }, [chosenScale]);

  const providerValues = useMemo(
    () => ({
      colorMode,
    }),
    [colorMode]
  );

  return (
    <ThemeContext.Provider value={providerValues}>
      <div className={`main ${chosenTheme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): IThemeContext => {
  return useContext(ThemeContext) as IThemeContext;
};
