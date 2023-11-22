import React, { type FC } from 'react';

import { ApiProvider, useApi } from './api';
import { ConfirmMessageProvider, useConfirmMessage } from './confirmMessage';
import { GlobalVarsProvider, useGlobalVars } from './globalVars';
import { LangProvider, useLang } from './lang';
import { SystemAlertsProvider, useSystemAlerts } from './systemAlerts';
import { ThemeProvider, useTheme } from './theme';

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

export { Providers, useApi, useConfirmMessage, useGlobalVars, useLang, useSystemAlerts, useTheme };
