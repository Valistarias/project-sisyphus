import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { IDamage } from '../damage/model';
import type { IAction, IEffect } from '../index';

interface IWeapon {
  /** The title of the weapon */
  title: string;
  /** A summary of the weapon */
  summary: string;
  /** A quote or text, MTG style */
  quote?: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated weaponType */
  weaponType: ObjectId;
  /** The rarity of the weapon */
  rarity: ObjectId;
  /** The range of the weapon */
  weaponScope: ObjectId;
  /** The item modifiers of the weapon */
  itemModifiers?: ObjectId[];
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
  effects?: string[] | ObjectId[];
  /** The actions related to the weapon */
  actions?: string[] | ObjectId[];
  /** The damages of the weapon */
  damages: string[] | ObjectId[];
  /** When the weapon was created */
  createdAt: Date;
}

type HydratedIWeapon = HydratedDocument<
  Omit<IWeapon, 'effects' | 'actions' | 'damages'> & {
    effects: IEffect[] | string[];
    actions: IAction[] | string[];
    damages: IDamage[] | string[];
  }
>;

const weaponSchema = new Schema<IWeapon>({
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

const WeaponModel = (): Model<IWeapon> => model('Weapon', weaponSchema);

export { WeaponModel, type HydratedIWeapon, type IWeapon };
