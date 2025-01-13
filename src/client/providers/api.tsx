import React, { useContext, useMemo, type FC, type ReactNode } from 'react';

import Api from '../api';

interface IApiContext {
  /** The childrens of the Providers element */
  api?: Api;
}

interface IApiProvider {
  /** The childrens of the Providers element */
  children: ReactNode;
}

const ApiContext = React.createContext<IApiContext | undefined>(undefined);

export const ApiProvider: FC<IApiProvider> = ({ children }) => {
  const providerValues = useMemo(
    () => ({
      api: new Api(),
    }),
    []
  );

  return <ApiContext.Provider value={providerValues}>{children}</ApiContext.Provider>;
};

export const useApi = (): IApiContext => useContext(ApiContext)!;
