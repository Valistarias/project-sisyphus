import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type ICharParam } from '../index';

interface ICharParamBonus {
  /** The associated charParam */
  charParam: ObjectId;
  /** The value of the bonus */
  value: number;
  /** When the charParam branch was created */
  createdAt: Date;
}

interface HydratedICharParamBonus extends Omit<HydratedDocument<ICharParamBonus>, 'charParam'> {
  charParam: ICharParam;
}

const effectSchema = new Schema<ICharParamBonus>({
  charParam: {
    type: Schema.Types.ObjectId,
    ref: 'CharParam',
  },
  value: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CharParamBonusModel = (): Model<ICharParamBonus> => model('CharParamBonus', effectSchema);

export { CharParamBonusModel, type HydratedICharParamBonus, type ICharParamBonus };
