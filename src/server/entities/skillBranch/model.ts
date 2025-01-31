import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { Lean } from '../../utils/types';
import type {
  HydratedINode,
  HydratedISkill,
  ISkill,
  LeanINode
} from '../index';

interface ISkillBranch<IdType> {
  /** The title of the skill branch */
  title: string
  /** A summary of the skill branch */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The associated skill branch */
  skill: IdType
  /** When the skill branch was created */
  createdAt: Date
}

type HydratedISkillBranch = HydratedDocument<
  Omit<ISkillBranch<string>, 'skill'> & {
    skill: HydratedISkill | ObjectId
    nodes?: HydratedINode[]
  }
>;

type LeanISkillBranch = Omit<Lean<ISkillBranch<string>>, 'skill'> & {
  skill: ISkill
  nodes?: LeanINode[]
};

const skillBranchSchema = new Schema<ISkillBranch<ObjectId>>(
  {
    title: String,
    summary: String,
    i18n: String,
    skill: {
      type: Schema.Types.ObjectId,
      ref: 'Skill'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals -------------------------

skillBranchSchema.virtual('nodes', {
  ref: 'Node',
  localField: '_id',
  foreignField: 'skillBranch'
});

const SkillBranchModel = (): Model<ISkillBranch<ObjectId>> => model('SkillBranch', skillBranchSchema);

export {
  SkillBranchModel,
  type HydratedISkillBranch,
  type ISkillBranch,
  type LeanISkillBranch
};
