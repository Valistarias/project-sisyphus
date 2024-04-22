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
  ICharacter,
  ICuratedCharParam,
  ICuratedCyberFrame,
  ICuratedDamageType,
  ICuratedItemModifier,
  ICuratedRarity,
  ICuratedRuleBook,
  ICuratedSkill,
  ICuratedStat,
  ICuratedWeaponScope,
  ICuratedWeaponStyle,
  ICuratedWeaponType,
  IItemType,
  IUser,
} from '../types';

interface IGlobalVarsContext {
  /** The logged user */
  user: IUser | null;
  /** Setting the user */
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  /** Is the provider loading */
  loading: boolean;
  /** The actual character */
  character: ICharacter | null | false;
  /** All the loaded rulebooks */
  ruleBooks: ICuratedRuleBook[];
  /** All the loaded campaigns */
  campaigns: ICampaign[];
  /** All the loaded damage types */
  damageTypes: ICuratedDamageType[];
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
  /** All the loaded item types */
  itemTypes: IItemType[];
  /** All the loaded item modifiers */
  itemModifiers: ICuratedItemModifier[];
  /** All the loaded rarities */
  rarities: ICuratedRarity[];
  /** All the loaded weapon scopes */
  weaponScopes: ICuratedWeaponScope[];
  /** All the loaded weapon styles */
  weaponStyles: ICuratedWeaponStyle[];
  /** All the loaded weapon types */
  weaponTypes: ICuratedWeaponType[];
  /** Used to set the actual character */
  setCharacter: (id: string) => void;
  /** Used to reset the actual character */
  resetCharacter: () => void;
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
  /** Used to trigger the reload of the damage types */
  reloadDamageTypes: () => void;
  /** Used to trigger the reload of the item types */
  reloadItemTypes: () => void;
  /** Used to trigger the reload of the item modifiers */
  reloadItemModifiers: () => void;
  /** Used to trigger the reload of the rarities */
  reloadRarities: () => void;
  /** Used to trigger the reload of the weapon scopes */
  reloadWeaponScopes: () => void;
  /** Used to trigger the reload of the weapon styles */
  reloadWeaponStyles: () => void;
  /** Used to trigger the reload of the weapon types */
  reloadWeaponTypes: () => void;
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

  // Character
  const [character, setCharacter] = useState<ICharacter | null | false>(null);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  // Rulebooks
  const [ruleBooks, setRuleBooks] = useState<ICuratedRuleBook[]>([]);

  // Rules
  const [actionTypes, setActionTypes] = useState<IActionType[]>([]);
  const [actionDurations, setActionDurations] = useState<IActionDuration[]>([]);
  const [stats, setStats] = useState<ICuratedStat[]>([]);
  const [skills, setSkills] = useState<ICuratedSkill[]>([]);
  const [charParams, setCharParams] = useState<ICuratedCharParam[]>([]);
  const [cyberFrames, setCyberFrames] = useState<ICuratedCyberFrame[]>([]);

  // Items
  const [damageTypes, setDamageTypes] = useState<ICuratedDamageType[]>([]);
  const [itemTypes, setItemTypes] = useState<IItemType[]>([]);
  const [itemModifiers, setItemModifiers] = useState<ICuratedItemModifier[]>([]);
  const [rarities, setRarities] = useState<ICuratedRarity[]>([]);
  const [weaponScopes, setWeaponScopes] = useState<ICuratedWeaponScope[]>([]);
  const [weaponStyles, setWeaponStyles] = useState<ICuratedWeaponStyle[]>([]);
  const [weaponTypes, setWeaponTypes] = useState<ICuratedWeaponType[]>([]);

  const getAllFromApi = useCallback(
    (request: string, setState: React.Dispatch<React.SetStateAction<any>>) => {
      if (api === undefined) {
        return;
      }
      api[request]
        .getAll()
        .then((data) => {
          setState(data);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [api]
  );

  const loadActionTypes = useCallback(() => {
    getAllFromApi('actionTypes', setActionTypes);
  }, [getAllFromApi]);

  const loadActionDurations = useCallback(() => {
    getAllFromApi('actionDurations', setActionDurations);
  }, [getAllFromApi]);

  const loadStats = useCallback(() => {
    getAllFromApi('stats', setStats);
  }, [getAllFromApi]);

  const loadSkills = useCallback(() => {
    getAllFromApi('skills', setSkills);
  }, [getAllFromApi]);

  const loadCharParams = useCallback(() => {
    getAllFromApi('charParams', setCharParams);
  }, [getAllFromApi]);

  const loadCyberFrames = useCallback(() => {
    getAllFromApi('cyberFrames', setCyberFrames);
  }, [getAllFromApi]);

  const loadRuleBooks = useCallback(() => {
    getAllFromApi('ruleBooks', setRuleBooks);
  }, [getAllFromApi]);

  const loadCampaigns = useCallback(() => {
    getAllFromApi('campaigns', setCampaigns);
  }, [getAllFromApi]);

  const loadItemTypes = useCallback(() => {
    getAllFromApi('itemTypes', setItemTypes);
  }, [getAllFromApi]);

  const loadItemModifiers = useCallback(() => {
    getAllFromApi('itemModifiers', setItemModifiers);
  }, [getAllFromApi]);

  const loadRarities = useCallback(() => {
    getAllFromApi('rarities', setRarities);
  }, [getAllFromApi]);

  const loadWeaponScopes = useCallback(() => {
    getAllFromApi('weaponScopes', setWeaponScopes);
  }, [getAllFromApi]);

  const loadWeaponStyles = useCallback(() => {
    getAllFromApi('weaponStyles', setWeaponStyles);
  }, [getAllFromApi]);

  const loadWeaponTypes = useCallback(() => {
    getAllFromApi('weaponTypes', setWeaponTypes);
  }, [getAllFromApi]);

  const loadDamageTypes = useCallback(() => {
    getAllFromApi('damageTypes', setDamageTypes);
  }, [getAllFromApi]);

  const setCharacterFromId = useCallback(
    (id: string) => {
      if (api === undefined || id === undefined) {
        return;
      }
      setLoading(true);
      api.characters
        .get({
          characterId: id,
        })
        .then((character: ICharacter) => {
          setLoading(false);
          if (character === undefined) {
            setCharacter(false);
          } else {
            setCharacter(character);
          }
        })
        .catch((err) => {
          setLoading(false);
          setCharacter(false);
          console.error(err);
        });
    },
    [api]
  );

  const resetCharacter = useCallback(() => {
    setCharacter(null);
  }, []);

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
            loadDamageTypes();
            loadStats();
            loadCharParams();
            loadSkills();
            loadCyberFrames();
            loadItemTypes();
            loadItemModifiers();
            loadRarities();
            loadWeaponScopes();
            loadWeaponStyles();
            loadWeaponTypes();
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
    loadItemModifiers,
    loadRarities,
    loadWeaponScopes,
    loadWeaponStyles,
    loadWeaponTypes,
    loadDamageTypes,
    loadItemTypes,
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
      itemModifiers,
      rarities,
      weaponScopes,
      weaponStyles,
      weaponTypes,
      damageTypes,
      itemTypes,
      reloadAll: () => {
        loadCampaigns();
        loadRuleBooks();
        loadStats();
        loadSkills();
        loadCharParams();
        loadCyberFrames();
        loadDamageTypes();
        loadActionTypes();
        loadActionDurations();
        loadItemModifiers();
        loadRarities();
        loadWeaponScopes();
        loadWeaponStyles();
        loadWeaponTypes();
        loadItemTypes();
      },
      reloadCampaigns: loadCampaigns,
      reloadCharParams: loadCharParams,
      reloadCyberFrames: loadCyberFrames,
      reloadRuleBooks: loadRuleBooks,
      reloadSkills: loadSkills,
      reloadStats: loadStats,
      setCharacter: setCharacterFromId,
      reloadItemModifiers: loadItemModifiers,
      reloadRarities: loadRarities,
      reloadWeaponScopes: loadWeaponScopes,
      reloadWeaponStyles: loadWeaponStyles,
      reloadWeaponTypes: loadWeaponTypes,
      reloadDamageTypes: loadDamageTypes,
      reloadItemTypes: loadItemTypes,
      character,
      ruleBooks,
      resetCharacter,
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
      loading,
      itemModifiers,
      rarities,
      weaponScopes,
      weaponStyles,
      weaponTypes,
      damageTypes,
      itemTypes,
      loadCampaigns,
      loadCharParams,
      loadCyberFrames,
      loadRuleBooks,
      loadSkills,
      loadStats,
      setCharacterFromId,
      loadItemModifiers,
      loadRarities,
      loadWeaponScopes,
      loadWeaponStyles,
      loadWeaponTypes,
      loadDamageTypes,
      loadItemTypes,
      character,
      ruleBooks,
      resetCharacter,
      skills,
      stats,
      user,
      loadActionTypes,
      loadActionDurations,
    ]
  );

  return <GlobalVarsContext.Provider value={providerValues}>{children}</GlobalVarsContext.Provider>;
};

export const useGlobalVars = (): IGlobalVarsContext => {
  return useContext(GlobalVarsContext) as IGlobalVarsContext;
};
