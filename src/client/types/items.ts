import { type InternationalizationType } from './global';
import { type IAction, type IEffect, type ISkill } from './rules';

// DamageTypes ------------------------------------
export interface IDamageType {
  /** The ID of the damage type */
  _id: string;
  /** The title of the damage type */
  title: string;
  /** A summary of the damage type */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: InternationalizationType;
  /** When the damage type was created */
  createdAt: string;
}

export interface ICuratedDamageType {
  i18n: InternationalizationType;
  damageType: IDamageType;
}

// Damages ------------------------------------
export interface IDamage {
  /** The ID of the damage */
  _id: string;
  /** The associated damageType */
  damageType: string;
  /** The dices formula of the damage (ex: 2d6 + 1) */
  dices: string;
  /** When the damage was created */
  createdAt: string;
}

// Items ------------------------------------
export interface IItemType {
  /** The ID of the item type */
  _id: string;
  /** A 3 letter string as name of the item type (never displayed as is) */
  name: string;
}

export interface IItemModifier {
  /** The ID of the effect */
  _id: string;
  /** The title of the item modifier */
  title: string;
  /** A summary of the item modifier */
  summary: string;
  /** A 3 letter string used for displaying accurate effects */
  modifierId: string;
  /** When the effect was created */
  createdAt: string;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedItemModifier {
  i18n: InternationalizationType;
  itemModifier: IItemModifier;
}

// Rarities ------------------------------------
export interface IRarity {
  /** The ID of the rarity */
  _id: string;
  /** The title of the rarity */
  title: string;
  /** A summary of the rarity */
  summary: string;
  /** The position of this rarity, in reference with others */
  position: number;
  /** When the rarity was created */
  createdAt: string;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedRarity {
  i18n: InternationalizationType;
  rarity: IRarity;
}

// WeaponScopes ------------------------------------
export interface IWeaponScope {
  /** The ID of the weapon scope */
  _id: string;
  /** The title of the weapon scope */
  title: string;
  /** A summary of the weapon scope */
  summary: string;
  /** A 3 letter string used for displaying accurate range */
  scopeId: string;
  /** When the weapon scope was created */
  createdAt: string;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedWeaponScope {
  i18n: InternationalizationType;
  weaponScope: IWeaponScope;
}

// WeaponStyles ------------------------------------
export interface IWeaponStyle {
  /** The ID of the weapon scope */
  _id: string;
  /** The title of the weapon scope */
  title: string;
  /** A summary of the weapon scope */
  summary: string;
  /** The associated skill */
  skill: ISkill;
  /** When the weapon scope was created */
  createdAt: string;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedWeaponStyle {
  i18n: InternationalizationType;
  weaponStyle: IWeaponStyle;
}

// WeaponTypes ------------------------------------
export interface IWeaponType {
  /** The ID of the weapon scope */
  _id: string;
  /** The title of the weapon scope */
  title: string;
  /** A summary of the weapon scope */
  summary: string;
  /** The associated weapon style */
  weaponStyle: IWeaponStyle;
  /** The associated item type */
  itemType: IItemType;
  /** The icon of the weapon */
  icon: string;
  /** Is this weapon type needs training to be used ? */
  needTraining: boolean;
  /** When the weapon scope was created */
  createdAt: string;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedWeaponType {
  i18n: InternationalizationType;
  weaponType: IWeaponType;
}

// Weapons ------------------------------------
export interface IWeapon {
  /** The ID of the stat bonus */
  _id: string;
  /** The title of the weapon */
  title: string;
  /** A summary of the weapon */
  summary: string;
  /** A quote or text, MTG style */
  quote?: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated weaponType */
  weaponType: string;
  /** The rarity of the weapon */
  rarity: string;
  /** The range of the weapon */
  weaponScope: string;
  /** The item modifiers of the weapon */
  itemModifiers?: string[];
  /** The cost of the weapon */
  cost: number;
  /** The size of the magasine */
  magasine?: number;
  /** How many ammos are usef for each shot */
  ammoPerShot?: number;
  /** The effects related to the weapon */
  effects?: IEffect[];
  /** The actions related to the weapon */
  actions?: IAction[];
  /** The damages of the weapon */
  damages: IDamage[];
  /** When the stat bonus was created */
  createdAt: string;
}

export interface ICuratedWeapon {
  i18n: InternationalizationType;
  weapon: IWeapon;
}
