import React, { type FC } from 'react';

import { ApiProvider } from './api';
import { GlobalVarsProvider } from './globalVar';
import { LangProvider } from './lang';
import { ThemeProvider } from './theme';
import { SystemAlertsProvider } from './systemAlerts';
import { ConfirmMessageProvider } from './confirmMessage';

interface ProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

const Providers: FC<ProviderProps> = ({ children }) => (
  <ApiProvider>
    <LangProvider>
      <SystemAlertsProvider>
        <GlobalVarsProvider>
          <ThemeProvider>
            <ConfirmMessageProvider>{children}</ConfirmMessageProvider>
          </ThemeProvider>
        </GlobalVarsProvider>
      </SystemAlertsProvider>
    </LangProvider>
  </ApiProvider>
);

export default Providers;
