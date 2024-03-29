import { type InternationalizationType } from './global';
import { type IRuleBook } from './rulebook';

// Stat ------------------------------------
export interface IStat {
  /** The ID of the Stat */
  _id: string;
  /** The title of the Stat */
  title: string;
  /** The summary of the Stat */
  summary: string;
  /** The short version of the Stat name */
  short: string;
  /** When the Stat was created */
  createdAt: string;
}

export interface ICuratedStat {
  i18n: InternationalizationType;
  stat: IStat;
}

// Stat Bonus ------------------------------------
export interface IStatBonus {
  /** The ID of the stat bonus */
  _id: string;
  /** The stat itself */
  stat: IStat;
  /** The value of the bonus */
  value: number;
  /** When the stat bonus was created */
  createdAt: string;
}

// Skill ------------------------------------
export interface ISkill {
  /** The ID of the Skill */
  _id: string;
  /** The title of the Skill */
  title: string;
  /** The summary of the Skill */
  summary: string;
  /** The correlated stat */
  stat: IStat;
  /** When the Skill was created */
  createdAt: string;
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
  skill: ISkill;
  /** The value of the bonus */
  value: number;
  /** When the skill bonus was created */
  createdAt: string;
}

// Skill Branch ------------------------------------
export interface ISkillBranch {
  /** The ID of the Skill Branch */
  _id: string;
  /** The title of the Skill Branch */
  title: string;
  /** The summary of the Skill Branch */
  summary: string;
  /** The skill linked to this branch */
  skill: ISkill;
  /** When the skill Branch was created */
  createdAt: string;
}

export interface ICuratedSkillBranch {
  i18n: InternationalizationType;
  skillBranch: ISkillBranch;
}

// Actions ------------------------------------
export interface IActionType {
  /** The ID of the action type */
  _id: string;
  /** The name of the action type */
  name: string;
}

export interface IAction {
  /** The ID of the action */
  _id: string;
  /** The type of the action */
  type: IActionType;
  /** The title of the action */
  title: string;
  /** The summary of the action */
  summary: string;
  /** The time to execute the action ? */
  time?: string;
  /** The associated skill */
  skill?: ISkill;
  /** The bonus (or malus) associated with the skill */
  offsetSkill?: string;
  /** All the related Chapters */
  damages: string;
  /** When the action was created */
  createdAt: string;
}

export interface ICuratedAction {
  i18n: InternationalizationType;
  action: IAction;
}

// Effects ------------------------------------
export interface IEffect {
  /** The ID of the effect */
  _id: string;
  /** The title of the effect */
  title: string;
  /** The summary of the effect */
  summary: string;
  /** The formula used for this effect */
  formula?: string;
  /** When the effect was created */
  createdAt: string;
}

export interface ICuratedEffect {
  i18n: InternationalizationType;
  action: IEffect;
}

// Character Params ------------------------------------
export interface ICharParam {
  /** The ID of the charParam */
  _id: string;
  /** The title of the charParam */
  title: string;
  /** The summary of the charParam */
  summary: string;
  /** The time to execute the charParam ? */
  short: string;
  /** When the charParam was created */
  createdAt: string;
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
  charParam: ICharParam;
  /** The value of the bonus */
  value: number;
  /** When the charParam bonus was created */
  createdAt: string;
}

// CyberFrame ------------------------------------
export interface ICyberFrame {
  /** The ID of the CyberFrame */
  _id: string;
  /** The title of the CyberFrame */
  title: string;
  /** The summary of the CyberFrame */
  summary: string;
  /** The rulebook where the CyberFrame is present */
  ruleBook: IRuleBook;
  /** When the CyberFrame was created */
  createdAt: string;
}

export interface ICuratedCyberFrame {
  i18n: InternationalizationType;
  cyberFrame: ICyberFrame;
}

// CyberFrame Branch ------------------------------------
export interface ICyberFrameBranch {
  /** The ID of the CyberFrame Branch */
  _id: string;
  /** The title of the CyberFrame Branch */
  title: string;
  /** The summary of the CyberFrame Branch */
  summary: string;
  /** The cyberframe of this branch */
  cyberFrame: ICyberFrame;
  /** When the cyberFrame Branch was created */
  createdAt: string;
}

export interface ICuratedCyberFrameBranch {
  i18n: InternationalizationType;
  cyberFrameBranch: ICyberFrameBranch;
}

// Node ------------------------------------
export interface INode {
  /** The ID of the Node */
  _id: string;
  /** The title of the Node */
  title: string;
  /** The summary of the Node */
  summary: string;
  /** Some lore for this node, MTG style */
  quote?: string;
  /** The correlated skill branch, id any */
  skillBranch?: ISkillBranch;
  /** The correlated cyberFrame branch, id any */
  cyberFrameBranch?: ICyberFrameBranch;
  /** The position/rank where the node is located */
  rank: number;
  /** The effects related to the node */
  effects?: IEffect[];
  /** The actions related to the node */
  actions?: IAction[];
  /** The skill bonuses related to the node */
  skillBonuses?: ISkillBonus[];
  /** The stat bonuses related to the node */
  statBonuses?: IStatBonus[];
  /** The charParam bonuses related to the node */
  charParamBonuses?: ICharParamBonus[];
  /** The overriden nodes by this one (to upgrade a previous node) */
  overrides?: string[];
  /** When the Node was created */
  createdAt: string;
}

export interface ICuratedNode {
  i18n: InternationalizationType;
  node: INode;
}
