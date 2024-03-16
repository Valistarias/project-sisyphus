import React, { type FC } from 'react';

import { ApiProvider, useApi } from './api';
import { ConfirmMessageProvider, useConfirmMessage } from './confirmMessage';
import { GlobalVarsProvider, useGlobalVars } from './globalVars';
import { LangProvider, useLang } from './lang';
import { RollWindowProvider, useRollWindow } from './rollWindow';
import { SocketProvider, useSocket } from './socket';
import { SystemAlertsProvider, useSystemAlerts } from './systemAlerts';
import { ThemeProvider, useTheme } from './theme';

interface ProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

const Providers: FC<ProviderProps> = ({ children }) => (
  <ApiProvider>
    <LangProvider>
      <GlobalVarsProvider>
        <ThemeProvider>
          <SocketProvider>
            <SystemAlertsProvider>
              <ConfirmMessageProvider>
                <RollWindowProvider>{children}</RollWindowProvider>
              </ConfirmMessageProvider>
            </SystemAlertsProvider>
          </SocketProvider>
        </ThemeProvider>
      </GlobalVarsProvider>
    </LangProvider>
  </ApiProvider>
);

export {
  Providers,
  useApi,
  useConfirmMessage,
  useGlobalVars,
  useLang,
  useRollWindow,
  useSocket,
  useSystemAlerts,
  useTheme,
};
