import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { IStat } from '../index';

interface IStatBonus {
  /** The associated stat */
  stat: ObjectId
  /** The value of the stat bonus */
  value: number
  /** When the stat branch was created */
  createdAt: Date
}

type HydratedIStatBonus = HydratedDocument<
  Omit<IStatBonus, 'stat'> & {
    stat: IStat
  }
>;

const statBonusSchema = new Schema<IStatBonus>({
  stat: {
    type: Schema.Types.ObjectId,
    ref: 'Stat'
  },
  value: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const StatBonusModel = (): Model<IStatBonus> => model('StatBonus', statBonusSchema);

export { StatBonusModel, type HydratedIStatBonus, type IStatBonus };
