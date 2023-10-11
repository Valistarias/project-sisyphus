import React, { type FC } from 'react';

import { GlobalVarsProvider } from './GlobalVars';
import { ApiProvider } from './api';

interface ProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element
}

const Providers: FC<ProviderProps> = ({ children }) => (
  <ApiProvider>
    <GlobalVarsProvider>
      {children}
    </GlobalVarsProvider>
  </ApiProvider>
);

export default Providers;
