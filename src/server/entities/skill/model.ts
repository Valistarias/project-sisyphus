import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { IStat } from '../index';

interface ISkill {
  /** The title of the skill */
  title: string;
  /** A summary of the skill */
  summary: string;
  /** A 3 letter string used for the formulas */
  formulaId: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated stat */
  stat: ObjectId;
  /** When the skill was created */
  createdAt: Date;
}

type LeanISkill = Omit<ISkill, 'stat'> & {
  stat: IStat;
};

type HydratedISkill = HydratedDocument<Omit<ISkill, 'stat'>> & {
  stat: IStat | string;
};

const skillSchema = new Schema<ISkill>(
  {
    title: String,
    summary: String,
    formulaId: String,
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

const SkillModel = (): Model<ISkill> => model('Skill', skillSchema);

export { SkillModel, type HydratedISkill, type ISkill, type LeanISkill };
