import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type {
  HydratedIAction,
  HydratedICharParamBonus,
  HydratedIEffect,
  HydratedISkillBonus,
  HydratedIStatBonus,
  IAction,
  ICharParamBonus,
  ICyberFrameBranch,
  IEffect,
  ISkillBonus,
  ISkillBranch,
  IStatBonus
} from '../index';

interface INode<IdType> {
  /** The title of the node */
  title: string
  /** A summary of the node */
  summary: string
  /** The icon of the node */
  icon: string
  /** A quote or text, MTG style */
  quote?: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The associated skillBranch */
  skillBranch?: IdType
  /** The associated cyberFrameBranch */
  cyberFrameBranch?: IdType
  /** The position/rank where the node is located */
  rank: number
  /** The effects related to the node */
  effects?: IdType[]
  /** The actions related to the node */
  actions?: IdType[]
  /** The skill bonuses related to the node */
  skillBonuses?: IdType[]
  /** The stat bonuses related to the node */
  statBonuses?: IdType[]
  /** The charParam bonuses related to the node */
  charParamBonuses?: IdType[]
  /** The overriden nodes by this one (to upgrade a previous node) */
  overrides?: IdType[]
  /** When the node was created */
  createdAt: Date
}

type HydratedINode = HydratedDocument<
  Omit<
    INode<string>,
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
    skillBranch?: ISkillBranch<string> | string
    cyberFrameBranch?: ICyberFrameBranch<string> | string
  }
>;

type LeanINode = Omit<
  INode<string>,
  | 'effects'
  | 'actions'
  | 'skillBonuses'
  | 'statBonuses'
  | 'charParamBonuses'
  | 'skillBranch'
  | 'cyberFrameBranch'
> & {
  effects: IEffect[]
  actions: IAction[]
  skillBonuses: ISkillBonus[]
  statBonuses: IStatBonus[]
  charParamBonuses: ICharParamBonus[]
  skillBranch?: ISkillBranch<string>
  cyberFrameBranch?: ICyberFrameBranch<string>
};

const nodeSchema = new Schema<INode<ObjectId>>({
  title: String,
  summary: String,
  icon: String,
  quote: String,
  i18n: String,
  skillBranch: {
    type: Schema.Types.ObjectId,
    ref: 'SkillBranch'
  },
  cyberFrameBranch: {
    type: Schema.Types.ObjectId,
    ref: 'CyberFrameBranch'
  },
  rank: Number,
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
  overrides: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Node'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const NodeModel = (): Model<INode<ObjectId>> => model('Node', nodeSchema);

export {
  NodeModel, type HydratedINode, type INode, type LeanINode
};
