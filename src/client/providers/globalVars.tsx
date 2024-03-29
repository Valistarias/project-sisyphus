import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';

import { useTranslation } from 'react-i18next';

import { useApi } from './api';

import type { ICampaign, ICuratedRuleBook, IUser } from '../types';

interface IGlobalVarsContext {
  /** The logged user */
  user: IUser | null;
  /** Setting the user */
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  /** Is the provider loading */
  loading: boolean;
  /** All the loaded rulebooks */
  ruleBooks: ICuratedRuleBook[];
  /** All the loaded campaigns */
  campaigns: ICampaign[];
  /** Used to trigger the reload of the rulebooks */
  triggerCampaignReload: () => void;
  /** Used to trigger the reload of the campaigns */
  triggerRuleBookReload: () => void;
}

interface GlobalVarsProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

const GlobalVarsContext = React.createContext<IGlobalVarsContext | null>(null);

export const GlobalVarsProvider: FC<GlobalVarsProviderProps> = ({ children }) => {
  const { api } = useApi();
  const { i18n } = useTranslation();

  const calledApi = useRef(false);

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [ruleBooks, setRuleBooks] = useState<ICuratedRuleBook[]>([]);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  const loadRuleBooks = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.ruleBooks
      .getAll()
      .then((data: ICuratedRuleBook[]) => {
        setRuleBooks(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

  const loadCampaigns = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.campaigns
      .getAll()
      .then((sentCampaigns: ICampaign[]) => {
        setCampaigns(sentCampaigns);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.auth
        .check()
        .then((data: IUser) => {
          if (data.mail !== undefined) {
            setUser(data);
            loadRuleBooks();
            loadCampaigns();
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [api, loadRuleBooks, loadCampaigns]);

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
      campaigns,
      triggerCampaignReload: loadCampaigns,
      triggerRuleBookReload: loadRuleBooks,
    }),
    [user, setUser, loading, ruleBooks, campaigns, loadCampaigns, loadRuleBooks]
  );

  return <GlobalVarsContext.Provider value={providerValues}>{children}</GlobalVarsContext.Provider>;
};

export const useGlobalVars = (): IGlobalVarsContext => {
  return useContext(GlobalVarsContext) as IGlobalVarsContext;
};
