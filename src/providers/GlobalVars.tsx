import React, {
  type FC,
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { useApi } from './api';
import { useTranslation } from 'react-i18next';
import { useSystemAlerts } from './systemAlerts';

import type { ICuratedRuleBook, IUser } from '../interfaces';
import { Alert } from '../organisms';
import { Ap } from '../atoms';

interface IGlobalVarsContext {
  /** The logged user */
  user: IUser | null;
  /** Setting the user */
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  /** Is the provider loading */
  loading: boolean;
  /** All the loaded rulebooks */
  ruleBooks: ICuratedRuleBook[];
  /** Used to trigger the reload of the rulebooks */
  triggerRuleBookReload: () => void;
}

interface GlobalVarsProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

const GlobalVarsContext = React.createContext<IGlobalVarsContext | null>(null);

export const GlobalVarsProvider: FC<GlobalVarsProviderProps> = ({ children }) => {
  const { api } = useApi();
  const { t, i18n } = useTranslation();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [ruleBooks, setRuleBooks] = useState<ICuratedRuleBook[]>([]);

  const loadRuleBooks = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.ruleBooks
      .getAll()
      .then((data: ICuratedRuleBook[]) => {
        setRuleBooks(data);
      })
      .catch(() => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('serverErrors.CYPU-301')}</Ap>
            </Alert>
          ),
        });
      });
  }, [api, createAlert, getNewId, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.auth
        .check()
        .then((data: IUser) => {
          if (data.mail !== undefined) {
            setUser(data);
            loadRuleBooks();
          }
          setLoading(false);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
          setLoading(false);
        });
    }
  }, [api, createAlert, getNewId, t, loadRuleBooks]);

  useEffect(() => {
    if (user !== null) {
      void i18n.changeLanguage(user.lang);
    } else {
      void i18n.changeLanguage('en');
    }
  }, [user, i18n]);

  const providerValues = useMemo(
    () => ({
      user,
      setUser,
      loading,
      ruleBooks,
      triggerRuleBookReload: loadRuleBooks,
    }),
    [user, setUser, loading, ruleBooks, loadRuleBooks]
  );

  return <GlobalVarsContext.Provider value={providerValues}>{children}</GlobalVarsContext.Provider>;
};

export const useGlobalVars = (): IGlobalVarsContext => {
  return useContext(GlobalVarsContext) as IGlobalVarsContext;
};
