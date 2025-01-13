import type { InternationalizationType } from './global';
import type { ICuratedNPC } from './npc';
import type {
  IAction,
  ICharParamBonus,
  ICuratedAction,
  ICuratedEffect,
  IEffect,
  ISkill,
  ISkillBonus,
  IStatBonus,
  TypeNodeIcons,
} from './rules';

export const possibleStarterKitValues = ['always', 'never', 'option'];
export type TypeStarterKitValues = (typeof possibleStarterKitValues)[number];

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
  createdAt: Date;
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
  createdAt: Date;
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
  createdAt: Date;
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
  createdAt: Date;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedRarity {
  i18n: InternationalizationType;
  rarity: IRarity;
}

// Bags ------------------------------------
export interface IBag {
  /** The ID of the rarity */
  _id: string;
  /** The title of the bag */
  title: string;
  /** A summary of the bag */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n: InternationalizationType;
  /** The rarity of the bag */
  rarity: string;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: TypeStarterKitValues;
  /** The range of the item storable in the bag */
  storableItemTypes: string[];
  /** The item modifiers of the bag */
  itemModifiers?: string[];
  /** The type of item */
  itemType: string;
  /** How many item it can store */
  size: number;
  /** The cost of the bag */
  cost: number;
  /** When the bag was created */
  createdAt: Date;
}

export interface ICuratedBag {
  i18n: InternationalizationType;
  bag: IBag;
}

// Ammos ------------------------------------
export interface IAmmo {
  /** The ID of the rarity */
  _id: string;
  /** The title of the ammo */
  title: string;
  /** A summary of the ammo */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: InternationalizationType;
  /** The rarity of the ammo */
  rarity: string;
  /** The type of item */
  itemType: string;
  /** All the weapons that can use this type of ammo */
  weaponTypes?: string[];
  /** The item modifiers of the ammo */
  itemModifiers?: string[];
  /** How this bullet impact the hit roll */
  offsetToHit?: number;
  /** How this bullet impact the damage score */
  offsetDamage?: number;
  /** The cost of a single element */
  cost: number;
  /** When the ammo was created */
  createdAt: Date;
}

export interface ICuratedAmmo {
  i18n: InternationalizationType;
  ammo: IAmmo;
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
  createdAt: Date;
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
  createdAt: Date;
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
  icon: TypeNodeIcons;
  /** Is this weapon type needs training to be used ? */
  needTraining: boolean;
  /** When the weapon scope was created */
  createdAt: Date;
  /** The internationalization */
  i18n?: InternationalizationType;
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
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: TypeStarterKitValues;
  /** How many ammos are usef for each shot */
  ammoPerShot?: number;
  /** The effects related to the weapon */
  effects?: IEffect[];
  /** The actions related to the weapon */
  actions?: IAction[];
  /** The damages of the weapon */
  damages: IDamage[];
  /** When the stat bonus was created */
  createdAt: Date;
}

export interface ICuratedWeapon {
  i18n: InternationalizationType;
  weapon: IWeapon;
}

// Program Scope ------------------------------------
export interface IProgramScope {
  /** The ID of the weapon scope */
  _id: string;
  /** The title of the weapon scope */
  title: string;
  /** A summary of the weapon scope */
  summary: string;
  /** A 3 letter string used for displaying accurate range */
  scopeId: string;
  /** The internationnal content, as a json, stringified */
  i18n?: InternationalizationType;
  /** When the weapon scope was created */
  createdAt: Date;
}

export interface ICuratedProgramScope {
  i18n: InternationalizationType;
  programScope: IProgramScope;
}

// Program ------------------------------------
export interface IProgram {
  /** The ID of the weapon scope */
  _id: string;
  /** The title of the program */
  title: string;
  /** A summary of the program */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the program */
  rarity: string;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: TypeStarterKitValues;
  /** The type of item */
  itemType: string;
  /** The type of program, as his range or type */
  programScope: string;
  /** How many times the program is usable before detroying itseld (undefined | 0 = no limits) */
  uses: number;
  /** How many RAM it costs */
  ram: number;
  /** How many meters it blasts (in meter) */
  radius?: number;
  /** The cost of the program */
  cost: number;
  /** The summon of the program */
  ai?: ICuratedNPC;
  /** How many AIs the program summons */
  aiSummoned?: number;
  /** The damages of the program */
  damages?: IDamage[];
  /** When the program was created */
  createdAt: Date;
}

export interface ICuratedProgram {
  i18n: InternationalizationType;
  program: IProgram;
}
// Implants ------------------------------------
export interface IImplant {
  /** The ID of the stat bonus */
  _id: string;
  /** The title of the implant */
  title: string;
  /** A summary of the implant */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: InternationalizationType;
  /** The rarity of the implant */
  rarity: string;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: TypeStarterKitValues;
  /** The cost of the implant */
  cost: number;
  /** The type of item */
  itemType: string;
  /** The item modifiers of the implant */
  itemModifiers?: string[];
  /** All the body parts that can install this implant */
  bodyParts: string[];
  /** The effects related to the implant */
  effects?: ICuratedEffect[];
  /** The actions related to the implant */
  actions?: ICuratedAction[];
  /** The skill bonuses related to the implant */
  skillBonuses?: ISkillBonus[];
  /** The stat bonuses related to the implant */
  statBonuses?: IStatBonus[];
  /** The charParam bonuses related to the implant */
  charParamBonuses?: ICharParamBonus[];
  /** When the stat bonus was created */
  createdAt: Date;
}

export interface ICuratedImplant {
  i18n: InternationalizationType;
  implant: IImplant;
}

// ArmorTypes ------------------------------------
export interface IArmorType {
  /** The ID of the armor type */
  _id: string;
  /** The title of the armor type */
  title: string;
  /** A summary of the armor type */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: InternationalizationType;
  /** When the armor type was created */
  createdAt: Date;
}

export interface ICuratedArmorType {
  i18n: InternationalizationType;
  armorType: IArmorType;
}

// Armors ------------------------------------
export interface IArmor {
  /** The ID of the stat bonus */
  _id: string;
  /** The title of the armor */
  title: string;
  /** A summary of the armor */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: InternationalizationType;
  /** The rarity of the armor */
  rarity: string;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: TypeStarterKitValues;
  /** The cost of the armor */
  cost: number;
  /** The type of item */
  itemType: string;
  /** The item modifiers of the armor */
  itemModifiers?: string[];
  /** All the body parts that can install this armor */
  armorType: string;
  /** The effects related to the armor */
  effects?: IEffect[];
  /** The actions related to the armor */
  actions?: IAction[];
  /** The skill bonuses related to the armor */
  skillBonuses?: ISkillBonus[];
  /** The stat bonuses related to the armor */
  statBonuses?: IStatBonus[];
  /** The charParam bonuses related to the armor */
  charParamBonuses?: ICharParamBonus[];
  /** When the stat bonus was created */
  createdAt: Date;
}

export interface ICuratedArmor {
  i18n: InternationalizationType;
  armor: IArmor;
}

// Items ------------------------------------
export interface IItem {
  /** The ID of the stat bonus */
  _id: string;
  /** The title of the item */
  title: string;
  /** A summary of the item */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: InternationalizationType;
  /** The rarity of the item */
  rarity: string;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: TypeStarterKitValues;
  /** The cost of the item */
  cost: number;
  /** The type of item */
  itemType: string;
  /** The item modifiers of the item */
  itemModifiers?: string[];
  /** The effects related to the item */
  effects?: IEffect[];
  /** The actions related to the item */
  actions?: IAction[];
  /** The skill bonuses related to the item */
  skillBonuses?: ISkillBonus[];
  /** The stat bonuses related to the item */
  statBonuses?: IStatBonus[];
  /** The charParam bonuses related to the item */
  charParamBonuses?: ICharParamBonus[];
  /** When the stat bonus was created */
  createdAt: Date;
}

export interface ICuratedItem {
  i18n: InternationalizationType;
  item: IItem;
}
