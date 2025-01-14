import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type {
  IAction,
  ICharParamBonus,
  IEffect,
  ISkillBonus,
  IStatBonus
} from '../index';

interface IItem {
  /** The title of the Item */
  title: string
  /** A summary of the Item */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The rarity of the Item */
  rarity: ObjectId
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option'
  /** The cost of the Item */
  cost: number
  /** The type of item */
  itemType: ObjectId
  /** The item modifiers of the item */
  itemModifiers?: ObjectId[]
  /** The effects related to the Item */
  effects?: string[] | ObjectId[]
  /** The actions related to the Item */
  actions?: string[] | ObjectId[]
  /** The skill bonuses related to the Item */
  skillBonuses?: string[] | ObjectId[]
  /** The stat bonuses related to the Item */
  statBonuses?: string[] | ObjectId[]
  /** The charParam bonuses related to the Item */
  charParamBonuses?: string[] | ObjectId[]
  /** When the Item was created */
  createdAt: Date
}

type HydratedIItem = HydratedDocument<
  Omit<IItem, 'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'> & {
    effects: IEffect[] | string[]
    actions: IAction[] | string[]
    skillBonuses: ISkillBonus[] | string[]
    statBonuses: IStatBonus[] | string[]
    charParamBonuses: ICharParamBonus[] | string[]
  }
>;

const itemSchema = new Schema<IItem>({
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

const ItemModel = (): Model<IItem> => model('Item', itemSchema);

export {
  ItemModel, type HydratedIItem, type IItem
};
