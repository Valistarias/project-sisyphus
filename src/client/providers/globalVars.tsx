import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';

import { useTranslation } from 'react-i18next';

import { useApi } from './api';

import type {
  IActionDuration,
  IActionType,
  ICampaign,
  ICuratedCharParam,
  ICuratedCyberFrame,
  ICuratedRuleBook,
  ICuratedSkill,
  ICuratedStat,
  IUser,
} from '../types';

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
  /** All the loaded stats */
  stats: ICuratedStat[];
  /** All the loaded skills */
  skills: ICuratedSkill[];
  /** All the loaded character parameters */
  charParams: ICuratedCharParam[];
  /** All the loaded CyberFrames */
  cyberFrames: ICuratedCyberFrame[];
  /** All the loaded action types */
  actionTypes: IActionType[];
  /** All the loaded action durations */
  actionDurations: IActionDuration[];
  /** Used to trigger the reload of the rulebooks */
  reloadCampaigns: () => void;
  /** Used to trigger the reload of the campaigns */
  reloadRuleBooks: () => void;
  /** Used to trigger the reload of the skills */
  reloadSkills: () => void;
  /** Used to trigger the reload of the stats */
  reloadStats: () => void;
  /** Used to trigger the reload of the character parameters */
  reloadCharParams: () => void;
  /** Used to trigger the reload of the cyber frames */
  reloadCyberFrames: () => void;
  /** Used to trigger the reload of all dynamic elements */
  reloadAll: () => void;
}

interface GlobalVarsProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode;
}

const GlobalVarsContext = React.createContext<IGlobalVarsContext | null>(null);

export const GlobalVarsProvider: FC<GlobalVarsProviderProps> = ({ children }) => {
  const { api } = useApi();
  const { i18n } = useTranslation();

  const calledApi = useRef(false);

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [actionTypes, setActionTypes] = useState<IActionType[]>([]);
  const [actionDurations, setActionDurations] = useState<IActionDuration[]>([]);
  const [stats, setStats] = useState<ICuratedStat[]>([]);
  const [skills, setSkills] = useState<ICuratedSkill[]>([]);
  const [charParams, setCharParams] = useState<ICuratedCharParam[]>([]);
  const [cyberFrames, setCyberFrames] = useState<ICuratedCyberFrame[]>([]);
  const [ruleBooks, setRuleBooks] = useState<ICuratedRuleBook[]>([]);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  const loadActionTypes = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.actionTypes
      .getAll()
      .then((data: IActionType[]) => {
        setActionTypes(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

  const loadActionDurations = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.actionDurations
      .getAll()
      .then((data: IActionDuration[]) => {
        setActionDurations(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

  const loadStats = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.stats
      .getAll()
      .then((data: ICuratedStat[]) => {
        setStats(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

  const loadSkills = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.skills
      .getAll()
      .then((data: ICuratedSkill[]) => {
        setSkills(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

  const loadCharParams = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.charParams
      .getAll()
      .then((data: ICuratedCharParam[]) => {
        setCharParams(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

  const loadCyberFrames = useCallback(() => {
    if (api === undefined) {
      return;
    }
    api.cyberFrames
      .getAll()
      .then((data: ICuratedCyberFrame[]) => {
        setCyberFrames(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api]);

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
            loadActionTypes();
            loadActionDurations();
            loadRuleBooks();
            loadCampaigns();
            loadStats();
            loadCharParams();
            loadSkills();
            loadCyberFrames();
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [
    api,
    loadRuleBooks,
    loadCampaigns,
    loadSkills,
    loadCharParams,
    loadStats,
    loadCyberFrames,
    loadActionTypes,
    loadActionDurations,
  ]);

  useEffect(() => {
    if (user !== null) {
      void i18n.changeLanguage(user.lang);
    } else {
      void i18n.changeLanguage('en');
    }
  }, [user, i18n]);

  const providerValues = useMemo(
    () => ({
      actionDurations,
      actionTypes,
      campaigns,
      charParams,
      cyberFrames,
      loading,
      reloadAll: () => {
        loadCampaigns();
        loadRuleBooks();
        loadStats();
        loadSkills();
        loadCharParams();
        loadCyberFrames();
        loadActionTypes();
        loadActionDurations();
      },
      reloadCampaigns: loadCampaigns,
      reloadCharParams: loadCharParams,
      reloadCyberFrames: loadCyberFrames,
      reloadRuleBooks: loadRuleBooks,
      reloadSkills: loadSkills,
      reloadStats: loadStats,
      ruleBooks,
      setUser,
      skills,
      stats,
      user,
    }),
    [
      actionDurations,
      actionTypes,
      campaigns,
      charParams,
      cyberFrames,
      loadActionDurations,
      loadActionTypes,
      loadCampaigns,
      loadCharParams,
      loadCyberFrames,
      loadRuleBooks,
      loadSkills,
      loadStats,
      loading,
      ruleBooks,
      skills,
      stats,
      user,
    ]
  );

  return <GlobalVarsContext.Provider value={providerValues}>{children}</GlobalVarsContext.Provider>;
};

export const useGlobalVars = (): IGlobalVarsContext => {
  return useContext(GlobalVarsContext) as IGlobalVarsContext;
};
