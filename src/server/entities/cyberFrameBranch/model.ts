import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type ICyberFrame } from '../index';

interface ICyberFrameBranch {
  /** The title of the skill */
  title: string;
  /** A summary of the skill */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated cyberFrame */
  cyberFrame: ObjectId;
  /** When the skill was created */
  createdAt: Date;
}

interface HydratedICyberFrameBranch
  extends Omit<HydratedDocument<ICyberFrameBranch>, 'cyberFrame'> {
  cyberFrame: ICyberFrame;
}

const effectSchema = new Schema<ICyberFrameBranch>({
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
  model('CyberFrameBranch', effectSchema);

export { CyberFrameBranchModel, type HydratedICyberFrameBranch, type ICyberFrameBranch };
