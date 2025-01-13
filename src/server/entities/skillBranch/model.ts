import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { INode, ISkill } from '../index';

interface ISkillBranch {
  /** The title of the skill branch */
  title: string
  /** A summary of the skill branch */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The associated skill branch */
  skill: ObjectId
  /** When the skill branch was created */
  createdAt: Date
}

type HydratedISkillBranch = HydratedDocument<
  Omit<ISkillBranch, 'skill'> & {
    skill: ISkill
    nodes?: INode[]
  }
>;

const skillBranchSchema = new Schema<ISkillBranch>(
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

const SkillBranchModel = (): Model<ISkillBranch> => model('SkillBranch', skillBranchSchema);

export { SkillBranchModel, type HydratedISkillBranch, type ISkillBranch };
