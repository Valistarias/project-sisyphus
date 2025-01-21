import type { FlattenMaps, ObjectId, Types } from 'mongoose';

import type { IAction, IActionDuration, IActionType, ICharParam, ICharParamBonus, ICyberFrameBranch, IDamageType, IEffect, IEnnemyAttack, IRuleBook, ISkill, ISkillBonus, ISkillBranch, IStat, IStatBonus } from '../entities';

// Global Types ------------------------------------
export type InternationalizationType = Record<string, Record<string, string>>;

// Curated Values ----------------------------------

export type ICuratedActionToSend = FlattenMaps<
  Omit<IAction, 'type' | 'duration' | 'skill'> & {
    type: IActionType | ObjectId
    duration: IActionDuration | ObjectId
    skill: ISkill | ObjectId
  } & {
    _id: Types.ObjectId
  }
>;

export type ICuratedEffectToSend = FlattenMaps<
  Omit<IEffect, 'type'> & {
    type: IActionType | string
  } & {
    _id: Types.ObjectId
  }
>;

export interface ICuratedNodeToSend {
  i18n?: string
  title: string
  summary: string
  createdAt: Date
  icon: string
  quote?: string | undefined
  rank: number
  overrides?: Array<FlattenMaps<ObjectId>> | string[]
  effects: ICuratedEffectToSend[]
  actions: ICuratedActionToSend[]
  skillBonuses: Array<FlattenMaps<Omit<ISkillBonus, 'skill'>> & {
    skill: FlattenMaps<ISkill> | FlattenMaps<ObjectId>
  }>
  statBonuses: Array<FlattenMaps<Omit<IStatBonus, 'stat'>> & {
    stat: FlattenMaps<IStat> | FlattenMaps<ObjectId>
  }>
  charParamBonuses: Array<FlattenMaps<Omit<ICharParamBonus, 'charParam'>> & {
    charParam: FlattenMaps<ICharParam> | FlattenMaps<ObjectId>
  }>
  skillBranch?: ObjectId | FlattenMaps<ISkillBranch>
  cyberFrameBranch?:
    ObjectId
    | FlattenMaps<ICyberFrameBranch>
  _id: Types.ObjectId
}

export interface ICuratedSkillToSend {
  i18n?: string
  title: string
  summary: string
  createdAt: Date
  formulaId: string
  stat: FlattenMaps<IStat> | FlattenMaps<ObjectId>
  branches: Array<FlattenMaps<ISkillBranch>>
  _id: Types.ObjectId
}

export interface ICuratedCyberFrameToSend {
  i18n?: string
  title: string
  summary: string
  createdAt: Date
  ruleBook: FlattenMaps<IRuleBook> | FlattenMaps<ObjectId>
  branches: Array<FlattenMaps<ICyberFrameBranch>>
  _id: Types.ObjectId
}

export type ICuratedEnnemyAttackToSend = FlattenMaps<Omit<IEnnemyAttack, 'damageType'> & {
  damageType: FlattenMaps<ObjectId> | FlattenMaps<IDamageType>
} & {
  _id: Types.ObjectId
}>;
