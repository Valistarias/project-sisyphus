import type { FlattenMaps, Types } from 'mongoose';

import type { IActionDuration, IActionType, ISkill } from '../entities';

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
