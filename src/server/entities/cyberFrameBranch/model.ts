import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { ICyberFrame, INode } from '../index';

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

type HydratedICyberFrameBranch = HydratedDocument<
  Omit<ICyberFrameBranch, 'cyberFrame'> & {
    cyberFrame: ICyberFrame;
    nodes?: INode[];
  }
>;

const cyberFrameBranchSchema = new Schema<ICyberFrameBranch>(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals -------------------------

cyberFrameBranchSchema.virtual('nodes', {
  ref: 'Node',
  localField: '_id',
  foreignField: 'cyberFrameBranch',
});

const CyberFrameBranchModel = (): Model<ICyberFrameBranch> =>
  model('CyberFrameBranch', cyberFrameBranchSchema);

export { CyberFrameBranchModel, type HydratedICyberFrameBranch, type ICyberFrameBranch };
