import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type {
  IAction,
  ICharParamBonus,
  ICyberFrameBranch,
  IEffect,
  ISkillBonus,
  ISkillBranch,
  IStatBonus,
} from '../index';

interface INode {
  /** The title of the node */
  title: string;
  /** A summary of the node */
  summary: string;
  /** The icon of the node */
  icon: string;
  /** A quote or text, MTG style */
  quote?: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated skillBranch */
  skillBranch?: ObjectId;
  /** The associated cyberFrameBranch */
  cyberFrameBranch?: ObjectId;
  /** The position/rank where the node is located */
  rank: number;
  /** The effects related to the node */
  effects?: string[] | ObjectId[];
  /** The actions related to the node */
  actions?: string[] | ObjectId[];
  /** The skill bonuses related to the node */
  skillBonuses?: string[] | ObjectId[];
  /** The stat bonuses related to the node */
  statBonuses?: string[] | ObjectId[];
  /** The charParam bonuses related to the node */
  charParamBonuses?: string[] | ObjectId[];
  /** The overriden nodes by this one (to upgrade a previous node) */
  overrides?: string[] | ObjectId[];
  /** When the node was created */
  createdAt: Date;
}

type HydratedINode = HydratedDocument<
  Omit<
    INode,
    | 'effects'
    | 'actions'
    | 'skillBonuses'
    | 'statBonuses'
    | 'charParamBonuses'
    | 'skillBranch'
    | 'cyberFrameBranch'
  > & {
    effects: IEffect[] | string[];
    actions: IAction[] | string[];
    skillBonuses: ISkillBonus[] | string[];
    statBonuses: IStatBonus[] | string[];
    charParamBonuses: ICharParamBonus[] | string[];
    skillBranch?: ISkillBranch | ObjectId;
    cyberFrameBranch?: ICyberFrameBranch | ObjectId;
  }
>;

const nodeSchema = new Schema<INode>({
  title: String,
  summary: String,
  icon: String,
  quote: String,
  i18n: String,
  skillBranch: {
    type: Schema.Types.ObjectId,
    ref: 'SkillBranch',
  },
  cyberFrameBranch: {
    type: Schema.Types.ObjectId,
    ref: 'CyberFrameBranch',
  },
  rank: Number,
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
  overrides: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Node',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NodeModel = (): Model<INode> => model('Node', nodeSchema);

export { NodeModel, type HydratedINode, type INode };
