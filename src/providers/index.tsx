import React, { type FC } from 'react';

import { ApiProvider } from './api';
import { GlobalVarsProvider } from './globalVars';
import { LangProvider } from './lang';

interface ProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element
}

const Providers: FC<ProviderProps> = ({ children }) => (
  <ApiProvider>
      <LangProvider>
        <GlobalVarsProvider>
          {children}
        </GlobalVarsProvider>
      </LangProvider>
  </ApiProvider>
);

export default Providers;
