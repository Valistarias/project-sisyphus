import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { Lean } from '../../utils/types';
import type { HydratedINode, ISkillBranch, IStat, LeanINode } from '../index';

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
  branches: Array<
    Lean<ISkillBranch<string>> & {
      nodes: LeanINode[];
    }
  >;
};

type HydratedISkill = HydratedDocument<Omit<ISkill, 'stat'>> & {
  stat: IStat | string;
  branches: Array<
    ISkillBranch<string> & {
      nodes: HydratedINode[];
    }
  >;
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

// Virtuals -------------------------

skillSchema.virtual('branches', {
  ref: 'SkillBranch',
  localField: '_id',
  foreignField: 'skill',
});

const SkillModel = (): Model<ISkill> => model('Skill', skillSchema);

export { SkillModel, type HydratedISkill, type ISkill, type LeanISkill };
