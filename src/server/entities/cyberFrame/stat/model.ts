import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { HydratedIStat } from '../../stat/model';

interface ICyberFrameStat {
  /** When the cyberFrame was created */
  createdAt: Date;
  /** The cyberFrame targeted */
  cyberFrame: ObjectId;
  /** The linked Stat */
  stat: ObjectId;
  /** What is the actual value of this stat */
  value: number;
}

type HydratedICyberFrameStat = HydratedDocument<
  Omit<ICyberFrameStat, 'stat'> & { stat: HydratedIStat }
>;

const CyberFrameStatSchema = new Schema<ICyberFrameStat>({
  cyberFrame: {
    type: Schema.Types.ObjectId,
    ref: 'CyberFrame',
  },
  stat: {
    type: Schema.Types.ObjectId,
    ref: 'Stat',
  },
  value: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CyberFrameStatModel = (): Model<ICyberFrameStat> =>
  model('CyberFrameStat', CyberFrameStatSchema);

export { CyberFrameStatModel, type HydratedICyberFrameStat, type ICyberFrameStat };
