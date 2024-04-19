import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type ISkill } from '../skill/model';

interface IWeaponStyle {
  /** The title of the weapon style */
  title: string;
  /** A summary of the weapon style */
  summary: string;
  /** The associated skill */
  skill: ObjectId;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the weapon style was created */
  createdAt: Date;
}

interface HydratedIWeaponStyle extends Omit<HydratedDocument<IWeaponStyle>, 'skill'> {
  skill: ISkill;
}

const userSchema = new Schema<IWeaponStyle>({
  title: String,
  summary: String,
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  },
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeaponStyleModel = (): Model<IWeaponStyle> => model('WeaponStyle', userSchema);

export { WeaponStyleModel, type HydratedIWeaponStyle, type IWeaponStyle };
