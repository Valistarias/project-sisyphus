import React, { type FC, type ReactNode } from 'react';

import { ApiProvider, useApi } from './api';
import { CampaignEventWindowProvider, useCampaignEventWindow } from './campaignEventWindow';
import { ConfirmMessageProvider, useConfirmMessage } from './confirmMessage';
import { GlobalVarsProvider, useGlobalVars } from './globalVars';
import { LangProvider, useLang } from './lang';
import { SocketProvider, useSocket } from './socket';
import { SystemAlertsProvider, useSystemAlerts } from './systemAlerts';
import { ThemeProvider, useTheme } from './theme';

interface ProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode;
}

const Providers: FC<ProviderProps> = ({ children }) => (
  <ApiProvider>
    <LangProvider>
      <GlobalVarsProvider>
        <ThemeProvider>
          <SocketProvider>
            <SystemAlertsProvider>
              <ConfirmMessageProvider>
                <CampaignEventWindowProvider>{children}</CampaignEventWindowProvider>
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
  useCampaignEventWindow,
  useConfirmMessage,
  useGlobalVars,
  useLang,
  useSocket,
  useSystemAlerts,
  useTheme,
};
