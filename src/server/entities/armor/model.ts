import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { Lean } from '../../utils/types';
import type {
  HydratedIAction,
  HydratedICharParamBonus,
  HydratedIEffect,
  HydratedISkillBonus,
  HydratedIStatBonus,
  IAction,
  ICharParamBonus,
  IEffect,
  ISkillBonus,
  IStatBonus
} from '../index';

interface IArmor<IdType> {
  /** The title of the Armor */
  title: string
  /** A summary of the Armor */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The rarity of the Armor */
  rarity: IdType
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option'
  /** The cost of the Armor */
  cost: number
  /** The type of item */
  itemType: IdType
  /** The item modifiers of the armor */
  itemModifiers?: IdType[]
  /** The related armor type */
  armorType: IdType
  /** The effects related to the Armor */
  effects?: IdType[]
  /** The actions related to the Armor */
  actions?: IdType[]
  /** The skill bonuses related to the Armor */
  skillBonuses?: IdType[]
  /** The stat bonuses related to the Armor */
  statBonuses?: IdType[]
  /** The charParam bonuses related to the Armor */
  charParamBonuses?: IdType[]
  /** When the Armor was created */
  createdAt: Date
}

type HydratedIArmor = HydratedDocument<
  Omit<IArmor<string>, 'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'> & {
    effects: HydratedIEffect[] | string[]
    actions: HydratedIAction[] | string[]
    skillBonuses: HydratedISkillBonus[] | string[]
    statBonuses: HydratedIStatBonus[] | string[]
    charParamBonuses: HydratedICharParamBonus[] | string[]
  }
>;

type LeanIArmor = Omit<Lean<IArmor<string>>, 'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'> & {
  effects: IEffect[]
  actions: IAction[]
  skillBonuses: ISkillBonus[]
  statBonuses: IStatBonus[]
  charParamBonuses: ICharParamBonus[]
};

const ArmorSchema = new Schema<IArmor<ObjectId>>({
  title: String,
  summary: String,
  i18n: String,
  cost: Number,
  itemType: {
    type: Schema.Types.ObjectId,
    ref: 'ItemType'
  },
  itemModifiers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ItemModifier'
    }
  ],
  armorType: {
    type: Schema.Types.ObjectId,
    ref: 'ArmorType'
  },
  rarity: {
    type: Schema.Types.ObjectId,
    ref: 'Rarity'
  },
  starterKit: {
    type: String,
    default: 'never'
  },
  effects: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Effect'
    }
  ],
  actions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Action'
    }
  ],
  skillBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SkillBonus'
    }
  ],
  statBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'StatBonus'
    }
  ],
  charParamBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'CharParamBonus'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ArmorModel = (): Model<IArmor<ObjectId>> => model('Armor', ArmorSchema);

export {
  ArmorModel, type HydratedIArmor, type IArmor, type LeanIArmor
};
