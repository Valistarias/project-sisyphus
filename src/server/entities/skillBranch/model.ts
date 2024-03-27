import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type ISkill } from '../index';

interface ISkillBranch {
  /** The title of the skill branch */
  title: string;
  /** A summary of the skill branch */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated skill branch */
  skill: ObjectId;
  /** When the skill branch was created */
  createdAt: Date;
}

interface HydratedISkillBranch extends Omit<HydratedDocument<ISkillBranch>, 'skill'> {
  skill: ISkill;
}

const effectSchema = new Schema<ISkillBranch>({
  title: String,
  summary: String,
  i18n: String,
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SkillBranchModel = (): Model<ISkillBranch> => model('SkillBranch', effectSchema);

export { SkillBranchModel, type HydratedISkillBranch, type ISkillBranch };
