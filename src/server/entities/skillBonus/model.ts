import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { ISkill } from '../index';

interface ISkillBonus {
  /** The associated skill */
  skill: ObjectId
  /** The value of the bonus */
  value: number
  /** When the skill branch was created */
  createdAt: Date
}

type HydratedISkillBonus = HydratedDocument<
  Omit<ISkillBonus, 'skill'> & { skill: ISkill }
>;

const skillBonusSchema = new Schema<ISkillBonus>({
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill'
  },
  value: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SkillBonusModel = (): Model<ISkillBonus> => model('SkillBonus', skillBonusSchema);

export {
  SkillBonusModel, type HydratedISkillBonus, type ISkillBonus
};
