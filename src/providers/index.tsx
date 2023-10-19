import React, { type FC } from 'react';

import { ApiProvider } from './api';
import { GlobalVarsProvider } from './globalVars';
import { LangProvider } from './lang';
import { SystemAlertsProvider } from './systemAlerts';

interface ProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element
}

const Providers: FC<ProviderProps> = ({ children }) => (
  <ApiProvider>
      <LangProvider>
        <GlobalVarsProvider>
          <SystemAlertsProvider>
            {children}
          </SystemAlertsProvider>
        </GlobalVarsProvider>
      </LangProvider>
  </ApiProvider>
);

export default Providers;
