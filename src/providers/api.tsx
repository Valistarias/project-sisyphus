import React, { useMemo, useContext, type FC } from 'react';

import Api from '../api';

interface IApiContext {
  /** The childrens of the Providers element */
  api?: Api
}

interface IApiProvider {
  /** The childrens of the Providers element */
  children: React.JSX.Element
}

const ApiContext = React.createContext<IApiContext | undefined>(undefined);

export const ApiProvider: FC<IApiProvider> = ({ children }) => {
  const providerValues = useMemo(() => ({
    api: new Api()
  }), []);

  return (
    <ApiContext.Provider value={providerValues}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): IApiContext => {
  return useContext(ApiContext) as IApiContext;
};
