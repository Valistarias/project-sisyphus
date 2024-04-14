import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type HydratedISkillBranch, type IStat } from '../index';

interface ISkill {
  /** The title of the skill */
  title: string;
  /** A summary of the skill */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated stat */
  stat: ObjectId;
  /** When the skill was created */
  createdAt: Date;
}

interface HydratedISkill extends Omit<HydratedDocument<ISkill>, 'stat'> {
  stat: IStat;
  branches: HydratedISkillBranch[];
}

const skillSchema = new Schema<ISkill>(
  {
    title: String,
    summary: String,
    i18n: String,
    stat: {
      type: Schema.Types.ObjectId,
      ref: 'Stat',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals -------------------------

skillSchema.virtual('branches', {
  ref: 'SkillBranch',
  localField: '_id',
  foreignField: 'skill',
});

const SkillModel = (): Model<ISkill> => model('Skill', skillSchema);

export { SkillModel, type HydratedISkill, type ISkill };
