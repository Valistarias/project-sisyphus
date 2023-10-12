import React, {
  type FC, useState, useMemo, useContext, useEffect
} from 'react';
import { useApi } from './api';
import { type IUser } from '../interfaces';

interface IGlobalVarsContext {
  /** The logged user */
  user: IUser | null
  /** Setting the user */
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>
  /** Is the provider loading */
  loading: boolean
}

interface GlobalVarsProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element
}

const GlobalVarsContext = React.createContext<IGlobalVarsContext | null>(null);

export const GlobalVarsProvider: FC<GlobalVarsProviderProps> = ({ children }) => {
  const { api } = useApi();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (api === undefined) { return; }
    api.auth.check()
      .then((data: IUser) => {
        if (data.mail !== undefined) {
          setUser(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log('Error', err);
        setLoading(false);
      });
  }, [api]);

  const providerValues = useMemo(() => ({
    user,
    setUser,
    loading
  }), [
    user,
    setUser,
    loading
  ]);

  return (
    <GlobalVarsContext.Provider value={providerValues}>
      {children}
    </GlobalVarsContext.Provider>
  );
};

export const useGlobalVars = (): IGlobalVarsContext => {
  return useContext(GlobalVarsContext) as IGlobalVarsContext;
};
