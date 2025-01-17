import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode
} from 'react';

import { useTranslation } from 'react-i18next';

import {
  curateCharacterParams,
  curateCharacterSkills,
  type ICuratedCharParamWithScore,
  type ICuratedSkillWithScore,
  type ICuratedStatWithScore
} from '../utils/character';

import { useApi } from './api';

import type Entity from '../api/entities/entity';
import type {
  IActionDuration,
  IActionType,
  ICampaign,
  ICharacter,
  ICuratedArmorType,
  ICuratedBodyPart,
  ICuratedCharParam,
  ICuratedCyberFrame,
  ICuratedDamageType,
  ICuratedItemModifier,
  ICuratedProgramScope,
  ICuratedRarity,
  ICuratedRuleBook,
  ICuratedSkill,
  ICuratedStat,
  ICuratedTipText,
  ICuratedWeaponScope,
  ICuratedWeaponStyle,
  ICuratedWeaponType,
  IGlobalValue,
  IItemType,
  IUser
} from '../types';

interface IGlobalVarsContext {
  /** The logged user */
  user: IUser | null
  /** Setting the user */
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>
  /** Is the provider loading */
  loading: boolean
  /** The actual character */
  character: ICharacter | null | false
  /** The agregated stats and skills of the actual character */
  characterStatSkills?: {
    stats: ICuratedStatWithScore[]
    skills: ICuratedSkillWithScore[]
  }
  /** The agregated character params of the actual character */
  characterParams?: ICuratedCharParamWithScore[]
  /** All the loaded body parts */
  bodyParts: ICuratedBodyPart[]
  /** All the loaded rulebooks */
  ruleBooks: ICuratedRuleBook[]
  /** All the loaded campaigns */
  campaigns: ICampaign[]
  /** All the loaded damage types */
  damageTypes: ICuratedDamageType[]
  /** All the loaded stats */
  stats: ICuratedStat[]
  /** All the loaded skills */
  skills: ICuratedSkill[]
  /** All the loaded character parameters */
  charParams: ICuratedCharParam[]
  /** All the loaded CyberFrames */
  cyberFrames: ICuratedCyberFrame[]
  /** All the loaded action types */
  actionTypes: IActionType[]
  /** All the loaded action durations */
  actionDurations: IActionDuration[]
  /** All the loaded item types */
  itemTypes: IItemType[]
  /** All the loaded item modifiers */
  itemModifiers: ICuratedItemModifier[]
  /** All the loaded rarities */
  rarities: ICuratedRarity[]
  /** All the loaded weapon scopes */
  weaponScopes: ICuratedWeaponScope[]
  /** All the loaded weapon styles */
  weaponStyles: ICuratedWeaponStyle[]
  /** All the loaded weapon types */
  weaponTypes: ICuratedWeaponType[]
  /** All the loaded armor types */
  armorTypes: ICuratedArmorType[]
  /** All the loaded program scopes */
  programScopes: ICuratedProgramScope[]
  /** All the loaded program scopes */
  tipTexts: ICuratedTipText[]
  /** All the loaded global value rules */
  globalValues: IGlobalValue[]
  /** Used to set the actual character */
  setCharacter: (character: ICharacter) => void
  /** Used to set the actual character fron his id */
  setCharacterFromId: (id: string) => void
  /** Used to reset the actual character */
  resetCharacter: () => void
  /** Used to trigger the reload of the program scopes */
  reloadBodyParts: () => void
  /** Used to trigger the reload of the rulebooks */
  reloadCampaigns: () => void
  /** Used to trigger the reload of the campaigns */
  reloadRuleBooks: () => void
  /** Used to trigger the reload of the skills */
  reloadSkills: () => void
  /** Used to trigger the reload of the stats */
  reloadStats: () => void
  /** Used to trigger the reload of the character parameters */
  reloadCharParams: () => void
  /** Used to trigger the reload of the cyber frames */
  reloadCyberFrames: () => void
  /** Used to trigger the reload of the damage types */
  reloadDamageTypes: () => void
  /** Used to trigger the reload of the item types */
  reloadItemTypes: () => void
  /** Used to trigger the reload of the item modifiers */
  reloadItemModifiers: () => void
  /** Used to trigger the reload of the rarities */
  reloadRarities: () => void
  /** Used to trigger the reload of the weapon scopes */
  reloadWeaponScopes: () => void
  /** Used to trigger the reload of the weapon styles */
  reloadWeaponStyles: () => void
  /** Used to trigger the reload of the weapon types */
  reloadWeaponTypes: () => void
  /** Used to trigger the reload of the armor types */
  reloadArmorTypes: () => void
  /** Used to trigger the reload of the program scopes */
  reloadProgramScopes: () => void
  /** Used to trigger the reload of the tip texts */
  reloadTipTexts: () => void
  /** Used to trigger the reload of the global values */
  reloadGlobalValues: () => void
  /** Used to trigger the reload of all dynamic elements */
  reloadAll: () => void
}

interface GlobalVarsProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode
}

const GlobalVarsContext = React.createContext<IGlobalVarsContext>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- To avoid null values
  {} as IGlobalVarsContext
);

export const GlobalVarsProvider: FC<GlobalVarsProviderProps> = (
  { children }
) => {
  const { api } = useApi();
  const { i18n } = useTranslation();

  const calledApi = useRef(false);

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Character
  const [character, setCharacter] = useState<ICharacter | null | false>(null);
  const [characterStatSkills, setCharacterStatSkills] = useState<
    | {
      stats: ICuratedStatWithScore[]
      skills: ICuratedSkillWithScore[]
    }
    | undefined
  >(undefined);
  const [characterParams, setCharacterParams]
  = useState<ICuratedCharParamWithScore[] | undefined>(
    undefined
  );
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [bodyParts, setBodyParts] = useState<ICuratedBodyPart[]>([]);

  // Rulebooks
  const [ruleBooks, setRuleBooks] = useState<ICuratedRuleBook[]>([]);

  // Rules
  const [actionTypes, setActionTypes] = useState<IActionType[]>([]);
  const [actionDurations, setActionDurations] = useState<IActionDuration[]>([]);
  const [stats, setStats] = useState<ICuratedStat[]>([]);
  const [skills, setSkills] = useState<ICuratedSkill[]>([]);
  const [charParams, setCharParams] = useState<ICuratedCharParam[]>([]);
  const [cyberFrames, setCyberFrames] = useState<ICuratedCyberFrame[]>([]);
  const [tipTexts, setTipTexts] = useState<ICuratedTipText[]>([]);
  const [globalValues, setGlobalValues] = useState<IGlobalValue[]>([]);

  // Items
  const [damageTypes, setDamageTypes] = useState<ICuratedDamageType[]>([]);
  const [itemTypes, setItemTypes] = useState<IItemType[]>([]);
  const [itemModifiers, setItemModifiers]
  = useState<ICuratedItemModifier[]>([]);
  const [rarities, setRarities] = useState<ICuratedRarity[]>([]);
  const [weaponScopes, setWeaponScopes] = useState<ICuratedWeaponScope[]>([]);
  const [weaponStyles, setWeaponStyles] = useState<ICuratedWeaponStyle[]>([]);
  const [weaponTypes, setWeaponTypes] = useState<ICuratedWeaponType[]>([]);
  const [programScopes, setProgramScopes]
  = useState<ICuratedProgramScope[]>([]);
  const [armorTypes, setArmorTypes] = useState<ICuratedArmorType[]>([]);

  const getAllFromApi = useCallback(
    (
      request: string,
      setState: React.Dispatch<React.SetStateAction<unknown>>
    ) => {
      if (api !== undefined) {
        (api[request] as Entity<unknown>)
          .getAll()
          .then((data) => {
            setState(data);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    [api]
  );

  const loadActionTypes = useCallback(() => {
    getAllFromApi('actionTypes', setActionTypes);
  }, [getAllFromApi]);

  const loadActionDurations = useCallback(() => {
    getAllFromApi('actionDurations', setActionDurations);
  }, [getAllFromApi]);

  const loadBodyParts = useCallback(() => {
    getAllFromApi('bodyParts', setBodyParts);
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

  const loadArmorTypes = useCallback(() => {
    getAllFromApi('armorTypes', setArmorTypes);
  }, [getAllFromApi]);

  const loadProgramScopes = useCallback(() => {
    getAllFromApi('programScopes', setProgramScopes);
  }, [getAllFromApi]);

  const loadTipTexts = useCallback(() => {
    getAllFromApi('tipTexts', setTipTexts);
  }, [getAllFromApi]);

  const loadGlobalValues = useCallback(() => {
    getAllFromApi('globalValues', setGlobalValues);
  }, [getAllFromApi]);

  const setCharacterFromId = useCallback(
    (id: string) => {
      if (api !== undefined) {
        setLoading(true);
        api.characters
          .get({ characterId: id })
          .then((character) => {
            setLoading(false);
            setCharacter(character);
          })
          .catch((err) => {
            setLoading(false);
            setCharacter(false);
            console.error(err);
          });
      }
    },
    [api]
  );

  // Calculating character stats, when everything needed is available
  useEffect(() => {
    if (character !== false && character !== null) {
      // Aggregated Skills
      const aggregatedSkills = curateCharacterSkills(
        character,
        skills,
        stats,
        cyberFrames
      );
      setCharacterStatSkills(aggregatedSkills);

      // Aggregated Character Parameters
      const charParamList = [
        'ini',
        'msp',
        'pyr',
        'arr'
      ];
      const aggregatedCharParams = curateCharacterParams({
        character,
        charParams,
        charParamList,
        skills: aggregatedSkills.skills,
        stats: aggregatedSkills.stats,
        cyberFrames,
        globalValues
      });
      setCharacterParams(aggregatedCharParams);
    }
  }, [
    character,
    skills,
    stats,
    cyberFrames,
    charParams,
    globalValues
  ]);

  const resetCharacter = useCallback(() => {
    setCharacter(null);
  }, []);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.auth
        .check()
        .then((data: IUser) => {
          setUser(data);
          loadActionDurations();
          loadActionTypes();
          loadArmorTypes();
          loadBodyParts();
          loadCampaigns();
          loadCharParams();
          loadCyberFrames();
          loadDamageTypes();
          loadGlobalValues();
          loadItemModifiers();
          loadItemTypes();
          loadProgramScopes();
          loadRarities();
          loadRuleBooks();
          loadSkills();
          loadStats();
          loadTipTexts();
          loadWeaponScopes();
          loadWeaponStyles();
          loadWeaponTypes();
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [
    api,
    loadActionDurations,
    loadArmorTypes,
    loadActionTypes,
    loadBodyParts,
    loadCampaigns,
    loadCharParams,
    loadCyberFrames,
    loadDamageTypes,
    loadItemModifiers,
    loadItemTypes,
    loadProgramScopes,
    loadRarities,
    loadRuleBooks,
    loadSkills,
    loadStats,
    loadWeaponScopes,
    loadWeaponStyles,
    loadWeaponTypes,
    loadTipTexts,
    loadGlobalValues
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
      bodyParts,
      campaigns,
      character,
      characterStatSkills,
      characterParams,
      charParams,
      cyberFrames,
      damageTypes,
      itemModifiers,
      itemTypes,
      loading,
      programScopes,
      rarities,
      ruleBooks,
      skills,
      stats,
      user,
      weaponScopes,
      weaponStyles,
      weaponTypes,
      armorTypes,
      tipTexts,
      globalValues,
      reloadAll: () => {
        loadActionDurations();
        loadActionTypes();
        loadArmorTypes();
        loadBodyParts();
        loadCampaigns();
        loadCharParams();
        loadCyberFrames();
        loadDamageTypes();
        loadGlobalValues();
        loadItemModifiers();
        loadItemTypes();
        loadProgramScopes();
        loadRarities();
        loadRuleBooks();
        loadSkills();
        loadStats();
        loadTipTexts();
        loadWeaponScopes();
        loadWeaponStyles();
        loadWeaponTypes();
      },
      reloadBodyParts: loadBodyParts,
      reloadCampaigns: loadCampaigns,
      reloadCharParams: loadCharParams,
      reloadCyberFrames: loadCyberFrames,
      reloadDamageTypes: loadDamageTypes,
      reloadItemModifiers: loadItemModifiers,
      reloadItemTypes: loadItemTypes,
      reloadProgramScopes: loadProgramScopes,
      reloadRarities: loadRarities,
      reloadRuleBooks: loadRuleBooks,
      reloadSkills: loadSkills,
      reloadStats: loadStats,
      reloadWeaponScopes: loadWeaponScopes,
      reloadWeaponStyles: loadWeaponStyles,
      reloadWeaponTypes: loadWeaponTypes,
      reloadArmorTypes: loadArmorTypes,
      reloadTipTexts: loadTipTexts,
      reloadGlobalValues: loadGlobalValues,
      setCharacter,
      setCharacterFromId,
      resetCharacter,
      setUser
    }),
    [
      actionDurations,
      actionTypes,
      bodyParts,
      campaigns,
      character,
      characterStatSkills,
      characterParams,
      charParams,
      cyberFrames,
      damageTypes,
      itemModifiers,
      itemTypes,
      loading,
      programScopes,
      rarities,
      ruleBooks,
      skills,
      stats,
      user,
      weaponScopes,
      weaponStyles,
      weaponTypes,
      armorTypes,
      tipTexts,
      globalValues,
      loadBodyParts,
      loadCampaigns,
      loadCharParams,
      loadCyberFrames,
      loadDamageTypes,
      loadItemModifiers,
      loadItemTypes,
      loadProgramScopes,
      loadRarities,
      loadRuleBooks,
      loadSkills,
      loadStats,
      loadWeaponScopes,
      loadWeaponStyles,
      loadWeaponTypes,
      loadArmorTypes,
      loadTipTexts,
      loadGlobalValues,
      setCharacterFromId,
      resetCharacter,
      loadActionTypes,
      loadActionDurations
    ]
  );

  return (
    <GlobalVarsContext.Provider value={providerValues}>
      {children}
    </GlobalVarsContext.Provider>
  );
};

export const useGlobalVars = (): IGlobalVarsContext =>
  useContext(GlobalVarsContext);
