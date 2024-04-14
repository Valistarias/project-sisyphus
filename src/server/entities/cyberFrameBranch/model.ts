import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type ICyberFrame } from '../index';

interface ICyberFrameBranch {
  /** The title of the cyberframe branch */
  title: string;
  /** A summary of the cyberframe branch */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated cyberFrame */
  cyberFrame: ObjectId;
  /** When the cyberframe branch was created */
  createdAt: Date;
}

interface HydratedICyberFrameBranch
  extends Omit<HydratedDocument<ICyberFrameBranch>, 'cyberFrame'> {
  cyberFrame: ICyberFrame;
}

const cyberFrameBranchSchema = new Schema<ICyberFrameBranch>({
  title: String,
  summary: String,
  i18n: String,
  cyberFrame: {
    type: Schema.Types.ObjectId,
    ref: 'CyberFrame',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CyberFrameBranchModel = (): Model<ICyberFrameBranch> =>
  model('CyberFrameBranch', cyberFrameBranchSchema);

export { CyberFrameBranchModel, type HydratedICyberFrameBranch, type ICyberFrameBranch };
