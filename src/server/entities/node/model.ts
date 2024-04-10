import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import {
  type IAction,
  type ICharParamBonus,
  type IEffect,
  type ISkillBonus,
  type IStatBonus,
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
  effects?: ObjectId[];
  /** The actions related to the node */
  actions?: ObjectId[];
  /** The skill bonuses related to the node */
  skillBonuses?: ObjectId[];
  /** The stat bonuses related to the node */
  statBonuses?: ObjectId[];
  /** The charParam bonuses related to the node */
  charParamBonuses?: ObjectId[];
  /** The overriden nodes by this one (to upgrade a previous node) */
  overrides?: ObjectId[];
  /** When the node was created */
  createdAt: Date;
}

interface HydratedINode
  extends Omit<
    HydratedDocument<INode>,
    'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'
  > {
  effects: IEffect[];
  actions: IAction[];
  skillBonuses: ISkillBonus[];
  statBonuses: IStatBonus[];
  charParamBonuses: ICharParamBonus[];
}

const effectSchema = new Schema<INode>({
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

const NodeModel = (): Model<INode> => model('Node', effectSchema);

export { NodeModel, type HydratedINode, type INode };
