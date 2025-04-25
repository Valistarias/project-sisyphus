import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { HydratedICharParam } from '../../charParam/model';

interface ICyberFrameCharParam {
  /** When the cyberFrame was created */
  createdAt: Date;
  /** The cyberFrame targeted */
  cyberFrame: ObjectId;
  /** The linked CharParam */
  charParam: ObjectId;
  /** What is the actual value of this charParam */
  value: number;
}

type HydratedICyberFrameCharParam = HydratedDocument<
  Omit<ICyberFrameCharParam, 'charParam'> & { charParam: HydratedICharParam }
>;

const CyberFrameCharParamSchema = new Schema<ICyberFrameCharParam>({
  cyberFrame: {
    type: Schema.Types.ObjectId,
    ref: 'CyberFrame',
  },
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

const CyberFrameCharParamModel = (): Model<ICyberFrameCharParam> =>
  model('CyberFrameCharParam', CyberFrameCharParamSchema);

export { CyberFrameCharParamModel, type HydratedICyberFrameCharParam, type ICyberFrameCharParam };
