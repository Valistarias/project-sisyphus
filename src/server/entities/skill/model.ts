import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IStat } from '../index';

interface ISkill {
  /** The title of the skill */
  title: string;
  /** A summary of the skill */
  summary: string;
  /** A short version of the skill */
  short: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated stat */
  stat: ObjectId;
  /** When the skill was created */
  createdAt: Date;
}

interface HydratedISkill extends Omit<HydratedDocument<ISkill>, 'stat'> {
  stat: IStat;
}

const effectSchema = new Schema<ISkill>({
  title: String,
  summary: String,
  short: String,
  i18n: String,
  stat: {
    type: Schema.Types.ObjectId,
    ref: 'Stat',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SkillModel = (): Model<ISkill> => model('Skill', effectSchema);

export { SkillModel, type HydratedISkill, type ISkill };
