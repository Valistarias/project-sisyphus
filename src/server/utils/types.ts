import type { FlattenMaps, ObjectId, Types } from 'mongoose';

import type { IAction, IActionDuration, IActionType, ICharParamBonus, ICyberFrameBranch, IDamageType, IEffect, IEnnemyAttack, ISkill, ISkillBonus, ISkillBranch, IStat, IStatBonus } from '../entities';

// Global Types ------------------------------------
export type InternationalizationType = Record<string, Record<string, string>>;

// Curated Values ----------------------------------

export interface ICuratedActionToSend {
  i18n?: string
  damages?: string | undefined
  title: string
  summary: string
  createdAt: Date
  isKarmic: boolean
  karmicCost?: number | undefined
  time?: string | undefined
  offsetSkill?: string | undefined
  uses?: number | undefined
  type: string | FlattenMaps<IActionType>
  duration: string | FlattenMaps<IActionDuration>
  skill: string | FlattenMaps<ISkill>
  _id: Types.ObjectId
}

export interface ICuratedEffectToSend {
  i18n?: string
  title: string
  summary: string
  createdAt: Date
  formula?: string | undefined
  type: string | FlattenMaps<IActionType>
  _id: Types.ObjectId
}

export interface ICuratedNodeToSend {
  i18n?: string
  title: string
  summary: string
  createdAt: Date
  icon: string
  quote?: string | undefined
  rank: number
  overrides?: string[] | ObjectId[]
  effects: Array<FlattenMaps<IEffect>> | string[]
  actions: Array<FlattenMaps<IAction>> | string[]
  skillBonuses: Array<FlattenMaps<ISkillBonus>> | string[]
  statBonuses: Array<FlattenMaps<IStatBonus>> | string[]
  charParamBonuses: Array<FlattenMaps<ICharParamBonus>> | string[]
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

export type ICuratedEnnemyAttackToSend = FlattenMaps<Omit<IEnnemyAttack, 'damageType'> & {
  damageType: IDamageType | string
} & {
  _id: Types.ObjectId
}>;
