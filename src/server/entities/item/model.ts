import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

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
  IStatBonus,
} from '../index';

interface IItem<IdType> {
  /** The title of the Item */
  title: string;
  /** A summary of the Item */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the Item */
  rarity: IdType;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option';
  /** The cost of the Item */
  cost: number;
  /** The type of item */
  itemType: IdType;
  /** The item modifiers of the item */
  itemModifiers?: IdType[];
  /** The effects related to the Item */
  effects?: IdType[];
  /** The actions related to the Item */
  actions?: IdType[];
  /** The skill bonuses related to the Item */
  skillBonuses?: IdType[];
  /** The stat bonuses related to the Item */
  statBonuses?: IdType[];
  /** The charParam bonuses related to the Item */
  charParamBonuses?: IdType[];
  /** When the Item was created */
  createdAt: Date;
}

type HydratedIItem = HydratedDocument<
  Omit<
    IItem<string>,
    'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'
  > & {
    effects: HydratedIEffect[] | string[];
    actions: HydratedIAction[] | string[];
    skillBonuses: HydratedISkillBonus[] | string[];
    statBonuses: HydratedIStatBonus[] | string[];
    charParamBonuses: HydratedICharParamBonus[] | string[];
  }
>;

type LeanIItem = Omit<
  Lean<IItem<string>>,
  'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'
> & {
  effects: IEffect[];
  actions: IAction[];
  skillBonuses: ISkillBonus[];
  statBonuses: IStatBonus[];
  charParamBonuses: ICharParamBonus[];
};

const itemSchema = new Schema<IItem<ObjectId>>({
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

const ItemModel = (): Model<IItem<ObjectId>> => model('Item', itemSchema);

export { ItemModel, type HydratedIItem, type IItem, type LeanIItem };
