import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { Lean } from '../../utils/types';
import type { HydratedIDamage, IDamage } from '../damage/model';
import type { HydratedIAction, HydratedIEffect, IAction, IEffect } from '../index';

interface IWeapon<IdType> {
  /** The title of the weapon */
  title: string;
  /** A summary of the weapon */
  summary: string;
  /** A quote or text, MTG style */
  quote?: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated weaponType */
  weaponType: IdType;
  /** The rarity of the weapon */
  rarity: IdType;
  /** The range of the weapon */
  weaponScope: IdType;
  /** The item modifiers of the weapon */
  itemModifiers?: IdType[];
  /** The cost of the weapon */
  cost: number;
  /** The size of the magasine */
  magasine?: number;
  /** How many ammos are usef for each shot */
  ammoPerShot?: number;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option';
  /** The effects related to the weapon */
  effects?: IdType[];
  /** The actions related to the weapon */
  actions?: IdType[];
  /** The damages of the weapon */
  damages: IdType[];
  /** When the weapon was created */
  createdAt: Date;
}

type HydratedIWeapon = HydratedDocument<
  Omit<IWeapon<string>, 'effects' | 'actions' | 'damages'> & {
    effects: HydratedIEffect[] | string[];
    actions: HydratedIAction[] | string[];
    damages: HydratedIDamage[] | string[];
  }
>;

type LeanIWeapon = Omit<Lean<IWeapon<string>>, 'effects' | 'actions' | 'damages'> & {
  effects: IEffect[];
  actions: IAction[];
  damages: IDamage[];
};

const weaponSchema = new Schema<IWeapon<ObjectId>>({
  title: String,
  summary: String,
  quote: String,
  i18n: String,
  weaponType: {
    type: Schema.Types.ObjectId,
    ref: 'WeaponType',
  },
  rarity: {
    type: Schema.Types.ObjectId,
    ref: 'Rarity',
  },
  weaponScope: {
    type: Schema.Types.ObjectId,
    ref: 'WeaponScope',
  },
  itemModifiers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ItemModifier',
    },
  ],
  cost: Number,
  magasine: Number,
  ammoPerShot: Number,
  starterKit: {
    type: String,
    default: 'never',
  },
  effects: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Effect',
    },
  ],
  actions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Action',
    },
  ],
  damages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Damage',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeaponModel = (): Model<IWeapon<ObjectId>> => model('Weapon', weaponSchema);

export { WeaponModel, type HydratedIWeapon, type IWeapon, type LeanIWeapon };
