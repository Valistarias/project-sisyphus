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

interface IImplant<IdType> {
  /** The title of the implant */
  title: string;
  /** A summary of the implant */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the implant */
  rarity: IdType;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option';
  /** The cost of the implant */
  cost: number;
  /** The type of item */
  itemType: IdType;
  /** The item modifiers of the implant */
  itemModifiers?: IdType[];
  /** All the body parts that can install this implant */
  bodyParts: IdType[];
  /** The effects related to the implant */
  effects?: IdType[];
  /** The actions related to the implant */
  actions?: IdType[];
  /** The skill bonuses related to the implant */
  skillBonuses?: IdType[];
  /** The stat bonuses related to the implant */
  statBonuses?: IdType[];
  /** The charParam bonuses related to the implant */
  charParamBonuses?: IdType[];
  /** When the implant was created */
  createdAt: Date;
}

type HydratedIImplant = HydratedDocument<
  Omit<
    IImplant<string>,
    | 'effects'
    | 'actions'
    | 'skillBonuses'
    | 'statBonuses'
    | 'charParamBonuses'
    | 'skillBranch'
    | 'cyberFrameBranch'
  > & {
    effects: HydratedIEffect[] | string[];
    actions: HydratedIAction[] | string[];
    skillBonuses: HydratedISkillBonus[] | string[];
    statBonuses: HydratedIStatBonus[] | string[];
    charParamBonuses: HydratedICharParamBonus[] | string[];
  }
>;

type LeanIImplant = Omit<
  Lean<IImplant<string>>,
  'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'
> & {
  effects: IEffect[];
  actions: IAction[];
  skillBonuses: ISkillBonus[];
  statBonuses: IStatBonus[];
  charParamBonuses: ICharParamBonus[];
};

const implantSchema = new Schema<IImplant<ObjectId>>({
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
  bodyParts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'BodyPart',
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

const ImplantModel = (): Model<IImplant<ObjectId>> => model('Implant', implantSchema);

export { ImplantModel, type HydratedIImplant, type IImplant, type LeanIImplant };
