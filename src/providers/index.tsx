import React, { type FC } from 'react';

import { GlobalVarsProvider } from './GlobalVars';

interface ProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element
}

const Providers: FC<ProviderProps> = ({ children }) => (
  <GlobalVarsProvider>
    {children}
  </GlobalVarsProvider>
);

export default Providers;
