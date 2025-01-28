import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { HydratedIStat } from '../../stat/model';

interface IBodyStat {
  /** When the body was created */
  createdAt: Date
  /** The body targeted */
  body: ObjectId
  /** The linked Stat */
  stat: ObjectId
  /** What is the actual value of this stat */
  value: number
}

type HydratedIBodyStat = HydratedDocument<
  Omit<IBodyStat, 'stat'> & { stat: HydratedIStat }
>;

const BodyStatSchema = new Schema<IBodyStat>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body'
  },
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

const BodyStatModel = (): Model<IBodyStat> => model('BodyStat', BodyStatSchema);

export {
  BodyStatModel, type HydratedIBodyStat, type IBodyStat
};
