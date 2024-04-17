import { type InternationalizationType } from './global';
import { type ISkill } from './rules';

// ItemModifiers ------------------------------------
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
  action: IItemModifier;
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
  action: IRarity;
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
  action: IWeaponScope;
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
  action: IWeaponStyle;
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
  /** When the weapon scope was created */
  createdAt: string;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedWeaponType {
  i18n: InternationalizationType;
  action: IWeaponType;
}
