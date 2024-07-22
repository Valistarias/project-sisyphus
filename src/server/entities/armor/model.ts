import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import {
  type IAction,
  type ICharParamBonus,
  type IEffect,
  type ISkillBonus,
  type IStatBonus,
} from '../index';

interface IArmor {
  /** The title of the Armor */
  title: string;
  /** A summary of the Armor */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the Armor */
  rarity: ObjectId;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option';
  /** The cost of the Armor */
  cost: number;
  /** The type of item */
  itemType: ObjectId;
  /** The item modifiers of the armor */
  itemModifiers?: ObjectId[];
  /** The related armor type */
  armorType: ObjectId;
  /** The effects related to the Armor */
  effects?: string[] | ObjectId[];
  /** The actions related to the Armor */
  actions?: string[] | ObjectId[];
  /** The skill bonuses related to the Armor */
  skillBonuses?: string[] | ObjectId[];
  /** The stat bonuses related to the Armor */
  statBonuses?: string[] | ObjectId[];
  /** The charParam bonuses related to the Armor */
  charParamBonuses?: string[] | ObjectId[];
  /** When the Armor was created */
  createdAt: Date;
}

type HydratedIArmor = HydratedDocument<
  Omit<IArmor, 'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'> & {
    effects: IEffect[] | string[];
    actions: IAction[] | string[];
    skillBonuses: ISkillBonus[] | string[];
    statBonuses: IStatBonus[] | string[];
    charParamBonuses: ICharParamBonus[] | string[];
  }
>;

const ArmorSchema = new Schema<IArmor>({
  title: String,
  summary: String,
  i18n: String,
  cost: Number,
  itemType: {
    type: Schema.Types.ObjectId,
    ref: 'ItemType',
  },
  itemModifiers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ItemModifier',
    },
  ],
  armorType: {
    type: Schema.Types.ObjectId,
    ref: 'ArmorType',
  },
  rarity: {
    type: Schema.Types.ObjectId,
    ref: 'Rarity',
  },
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
  skillBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SkillBonus',
    },
  ],
  statBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'StatBonus',
    },
  ],
  charParamBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'CharParamBonus',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ArmorModel = (): Model<IArmor> => model('Armor', ArmorSchema);

export { ArmorModel, type HydratedIArmor, type IArmor };
