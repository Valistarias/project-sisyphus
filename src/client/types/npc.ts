import type { InternationalizationType } from './global';

// EnnemyAttacks ------------------------------------
export interface IEnnemyAttack {
  /** The ID of the damage type */
  _id: string
  /** The title of the Ennemy Attack */
  title: string
  /** A summary of the Ennemy Attack */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n: InternationalizationType
  /** The associated damageType */
  damageType: string
  /** The range of the attack */
  weaponScope: string
  /** The dices formula of the damage (ex: 2d6 + 1) */
  dices: string
  /** The bonus to roll this attack */
  bonusToHit?: number
  /** When the Ennemy Attack was created */
  createdAt: Date
}

export interface ICuratedEnnemyAttack {
  i18n: InternationalizationType
  ennemyAttack: IEnnemyAttack
}

// NPC ------------------------------------
export interface INPC {
  /** The ID of the rarity */
  _id: string
  /** The title of the NPC */
  title: string
  /** A summary of the NPC */
  summary: string
  /** Is the NPC virtual */
  virtual: boolean
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The land speed of the NPC (in meter) */
  speed: number
  /** The flight speed of the NPC (in meter) */
  flightSpeed?: number
  /** The swim speed of the NPC (in meter) */
  swimSpeed?: number
  /** The HP of the NPC */
  hp: number
  /** The physical resistance of the NPC */
  pr?: number
  /** The ArtNet resistance of the NPC */
  ar: number
  /** The attacks of the NPC */
  attacks: IEnnemyAttack[]
  /** When the NPC was created */
  createdAt: Date
}

export interface BasicNPC extends Omit<INPC, 'attacks'> {
  /** The attacks of the NPC */
  attacks: string[]
}

export interface ICuratedNPC {
  i18n: InternationalizationType
  nPC: INPC
}

export interface ICuratedBasicNPC {
  i18n: InternationalizationType
  nPC: BasicNPC
}
