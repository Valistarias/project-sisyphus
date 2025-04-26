import type { InternationalizationType } from './global';
import type { IRuleBook } from './rulebook';

// Stat ------------------------------------
export interface IStat {
  /** The ID of the Stat */
  _id: string;
  /** The title of the Stat */
  title: string;
  /** The summary of the Stat */
  summary: string;
  /** A 3 letter string used for the formulas */
  formulaId: string;
  /** The short version of the Stat name */
  short: string;
  /** When the Stat was created */
  createdAt: Date;
}

export interface ICuratedStat {
  i18n: InternationalizationType;
  stat: IStat;
}

// Clergy ------------------------------------
export interface IClergy {
  /** The ID of the Clergy */
  _id: string;
  /** The title of the Clergy */
  title: string;
  /** The summary of the Clergy */
  summary: string;
  /** The associated rulebook */
  ruleBook: string;
  /** The icon of the Clergy */
  icon: string;
  /** The associated vows */
  vows: ICuratedVow[];
  /** When the Clergy was created */
  createdAt: Date;
}

export interface ICuratedClergy {
  i18n: InternationalizationType;
  clergy: IClergy;
}

// Vow ------------------------------------
export interface IVow {
  /** The ID of the Vow */
  _id: string;
  /** The title of the Vow */
  title: string;
  /** The associated rulebook */
  clergy: string;
  /** The position of this vow, in reference with other vows in clergy */
  position: number;
  /** When the Vow was created */
  createdAt: Date;
}

export interface ICuratedVow {
  i18n: InternationalizationType;
  vow: IVow;
}

// Stat Bonus ------------------------------------
export interface IStatBonus {
  /** The ID of the stat bonus */
  _id: string;
  /** The stat itself */
  stat: string;
  /** The value of the bonus */
  value: number;
  /** When the stat bonus was created */
  createdAt: Date;
}

// Skill ------------------------------------
export interface ISkill {
  /** The ID of the Skill */
  _id: string;
  /** The title of the Skill */
  title: string;
  /** The summary of the Skill */
  summary: string;
  /** A 3 letter string used for the formulas */
  formulaId: string;
  /** The correlated stat */
  stat: IStat;
  /** When the Skill was created */
  createdAt: Date;
}

export interface ICuratedSkill {
  i18n: InternationalizationType;
  skill: ISkill;
}

// Skill Bonus ------------------------------------
export interface ISkillBonus {
  /** The ID of the skill bonus */
  _id: string;
  /** The skill itself */
  skill: string;
  /** The value of the bonus */
  value: number;
  /** When the skill bonus was created */
  createdAt: Date;
}

// Actions ------------------------------------
export interface IActionType {
  /** The ID of the action type */
  _id: string;
  /** The name of the action type */
  name: string;
}

export interface IActionDuration {
  /** The ID of the action duration */
  _id: string;
  /** The name of the action duration */
  name: string;
}

export interface IAction {
  /** The ID of the action */
  _id: string;
  /** The type of the action */
  type: string;
  /** The duration of the action */
  duration: string;
  /** The title of the action */
  title: string;
  /** The summary of the action */
  summary: string;
  /** The time to execute the action ? */
  time?: string;
  /** The associated skill */
  skill?: string;
  /** The bonus (or malus) associated with the skill */
  offsetSkill?: string;
  /** Is this action a karma offering ? */
  isKarmic: boolean;
  /** Cost of karma, if karmic offering */
  karmicCost?: number;
  /** How many times the action is usable in a day */
  uses?: number;
  /** All the related Chapters */
  damages?: string;
  /** When the action was created */
  createdAt: Date;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedAction {
  i18n: InternationalizationType;
  action: IAction;
}

// Effects ------------------------------------
export interface IEffect {
  /** The ID of the effect */
  _id: string;
  /** The type of the effect */
  type: string;
  /** The title of the effect */
  title: string;
  /** The summary of the effect */
  summary: string;
  /** The formula used for this effect */
  formula?: string;
  /** When the effect was created */
  createdAt: Date;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedEffect {
  i18n: InternationalizationType;
  effect: IEffect;
}

// Character Params ------------------------------------
export interface ICharParam {
  /** The ID of the charParam */
  _id: string;
  /** The title of the charParam */
  title: string;
  /** A 3 letter string used for the formulas */
  formulaId: string;
  /** The summary of the charParam */
  summary: string;
  /** The time to execute the charParam ? */
  short: string;
  /** When the charParam was created */
  createdAt: Date;
}

export interface ICuratedCharParam {
  i18n: InternationalizationType;
  charParam: ICharParam;
}

// Character Params Bonus ------------------------------------
export interface ICharParamBonus {
  /** The ID of the charParam bonus */
  _id: string;
  /** The char param */
  charParam: string;
  /** The value of the bonus */
  value: number;
  /** When the charParam bonus was created */
  createdAt: Date;
}

// CyberFrame Stat ------------------------------------
export interface ICyberFrameStat {
  /** The ID of the cyberFrame stat */
  _id: string;
  /** The cyberFrame targeted */
  cyberFrame: string;
  /** The linked Stat */
  stat: string;
  /** What is the actual value of this stat */
  value: number;
  /** When the cyberFrame was created */
  createdAt: Date;
}

// CyberFrame CharParam ------------------------------------
export interface ICyberFrameCharParam {
  /** The ID of the cyberFrame charParam */
  _id: string;
  /** The cyberFrame targeted */
  cyberFrame: string;
  /** The linked CharParam */
  charParam: string;
  /** What is the actual value of this charParam */
  value: number;
  /** When the cyberFrame was created */
  createdAt: Date;
}

// CyberFrame ------------------------------------
export interface ICyberFrame {
  /** The ID of the CyberFrame */
  _id: string;
  /** The title of the CyberFrame */
  title: string;
  /** The summary of the CyberFrame */
  summary: string;
  /** The associated stats bonuses to this cyberframe */
  stats: ICyberFrameStat[];
  /** The associated charParams bonuses to this cyberframe */
  charParams: ICyberFrameCharParam[];
  /** The rulebook where the CyberFrame is present */
  ruleBook: IRuleBook;
  /** When the CyberFrame was created */
  createdAt: Date;
}

export interface ICuratedCyberFrame {
  i18n: InternationalizationType;
  cyberFrame: ICyberFrame;
}

export type ICuratedCyberFrameStat = Omit<ICyberFrameStat, 'stat'> & {
  stat: ICuratedStat;
};

export type ICuratedCyberFrameCharParam = Omit<ICyberFrameCharParam, 'charParam'> & {
  charParam: ICuratedCharParam;
};

export interface ICompleteCyberFrame {
  i18n: InternationalizationType;
  cyberFrame: Omit<ICyberFrame, 'stats' | 'charParams'> & {
    stats: ICuratedCyberFrameStat[];
    charParams: ICuratedCyberFrameCharParam[];
  };
}

// Node ------------------------------------

export const possibleNodeIcons = [
  'adn',
  'animalhandl',
  'artnet',
  'arts',
  'bow',
  'brain',
  'build',
  'bullets',
  'charm',
  'cog',
  'connected',
  'cross',
  'deceit',
  'default',
  'eidoloneye',
  'endu',
  'energy',
  'energyhammer',
  'energyrifle',
  'energysword',
  'engine',
  'expertise',
  'explosion',
  'fight',
  'finesse',
  'firearm',
  'flame',
  'flask',
  'formation',
  'gatling',
  'genknow',
  'gravity',
  'grenade',
  'harmonisation',
  'heart',
  'heavyhammer',
  'heavysword',
  'heavyweapons',
  'hourglass',
  'improvised',
  'insigna',
  'intimidation',
  'jetset',
  'katana',
  'key',
  'knife',
  'lance',
  'languages',
  'leadership',
  'logo',
  'maitrisesoi',
  'martial',
  'medicine',
  'missileweapon',
  'orientation',
  'parkour',
  'perception',
  'persuade',
  'pistol',
  'psych',
  'raisonn',
  'repair',
  'rifle',
  'rocket',
  'run',
  'scale',
  'scroll',
  'shield',
  'shotgun',
  'shotgunshells',
  'shuriken',
  'smg',
  'sniper',
  'sof',
  'soh',
  'spark',
  'spider',
  'star',
  'star2',
  'stealth',
  'survival',
  'swim',
  'sword',
  'syringe',
  'tactic',
  'throwable',
  'time',
  'vault',
  'tarot0',
  'tarot1',
  'tarot10',
  'tarot11',
  'tarot12',
  'tarot13',
  'tarot14',
  'tarot15',
  'tarot16',
  'tarot17',
  'tarot18',
  'tarot19',
  'tarot2',
  'tarot20',
  'tarot21',
  'tarot3',
  'tarot4',
  'tarot5',
  'tarot6',
  'tarot7',
  'tarot8',
  'tarot9',
] as const;

export type TypeNodeIcons = (typeof possibleNodeIcons)[number];
export interface INode {
  /** The ID of the Node */
  _id: string;
  /** The title of the Node */
  title: string;
  /** The summary of the Node */
  summary: string;
  /** The icon of the Node */
  icon: TypeNodeIcons;
  /** Some lore for this node, MTG style */
  quote?: string;
  /** The position/rank where the node is located */
  rank: number;
  /** The effects related to the node */
  effects: ICuratedEffect[];
  /** The actions related to the node */
  actions: ICuratedAction[];
  /** The skill bonuses related to the node */
  skillBonuses: ISkillBonus[];
  /** The stat bonuses related to the node */
  statBonuses: IStatBonus[];
  /** The charParam bonuses related to the node */
  charParamBonuses: ICharParamBonus[];
  /** The overriden nodes by this one (to upgrade a previous node) */
  overrides?: string[];
  /** When the Node was created */
  createdAt: Date;
}

export interface ICuratedNode {
  i18n: InternationalizationType;
  node: INode;
}

// TipTexts ------------------------------------

export interface ITipText {
  /** The ID of the effect */
  _id: string;
  /** The title of the item modifier */
  title: string;
  /** A summary of the item modifier */
  summary: string;
  /** A string used for identifying and displaying the right tip */
  tipId: string;
  /** When the effect was created */
  createdAt: Date;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedTipText {
  i18n: InternationalizationType;
  tipText: ITipText;
}

// Global Values ------------------------------------
export interface IGlobalValue {
  /** The ID of the global value */
  _id: string;
  /** A string as name of the global value (never displayed as is, used for data) */
  name: string;
  /** The value of the parameter */
  value: string;
}
