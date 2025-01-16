import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type {
  HydratedIAction,
  HydratedICharParamBonus,
  HydratedIEffect,
  HydratedISkillBonus,
  HydratedIStatBonus
} from '../index';

interface IImplant {
  /** The title of the implant */
  title: string
  /** A summary of the implant */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The rarity of the implant */
  rarity: ObjectId
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option'
  /** The cost of the implant */
  cost: number
  /** The type of item */
  itemType: ObjectId
  /** The item modifiers of the implant */
  itemModifiers?: ObjectId[]
  /** All the body parts that can install this implant */
  bodyParts: ObjectId[]
  /** The effects related to the implant */
  effects?: string[] | ObjectId[]
  /** The actions related to the implant */
  actions?: string[] | ObjectId[]
  /** The skill bonuses related to the implant */
  skillBonuses?: string[] | ObjectId[]
  /** The stat bonuses related to the implant */
  statBonuses?: string[] | ObjectId[]
  /** The charParam bonuses related to the implant */
  charParamBonuses?: string[] | ObjectId[]
  /** When the implant was created */
  createdAt: Date
}

type HydratedIImplant = HydratedDocument<
  Omit<IImplant,
  | 'effects'
  | 'actions'
  | 'skillBonuses'
  | 'statBonuses'
  | 'charParamBonuses'
  | 'skillBranch'
  | 'cyberFrameBranch'
  > & {
    effects: HydratedIEffect[] | string[]
    actions: HydratedIAction[] | string[]
    skillBonuses: HydratedISkillBonus[] | string[]
    statBonuses: HydratedIStatBonus[] | string[]
    charParamBonuses: HydratedICharParamBonus[] | string[]
  }
>;

const implantSchema = new Schema<IImplant>({
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
  bodyParts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'BodyPart'
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

const ImplantModel = (): Model<IImplant> => model('Implant', implantSchema);

export {
  ImplantModel, type HydratedIImplant, type IImplant
};
