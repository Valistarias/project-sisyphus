import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { HydratedISkill } from '../../skill/model';

interface IBodySkill {
  /** When the body was created */
  createdAt: Date;
  /** The body targeted */
  body: ObjectId;
  /** The linked Skill */
  skill: ObjectId;
  /** What is the actual value of this skill */
  value: number;
}

type HydratedIBodySkill = HydratedDocument<Omit<IBodySkill, 'skill'> & { skill: HydratedISkill }>;

const BodySkillSchema = new Schema<IBodySkill>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body',
  },
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  },
  value: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BodySkillModel = (): Model<IBodySkill> => model('BodySkill', BodySkillSchema);

export { BodySkillModel, type HydratedIBodySkill, type IBodySkill };
