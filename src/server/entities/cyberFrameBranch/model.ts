import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { Lean } from '../../utils/types';
import type { HydratedICyberFrame, HydratedINode, ICyberFrame, LeanINode } from '../index';

interface ICyberFrameBranch<IdType> {
  /** The title of the cyberframe branch */
  title: string;
  /** A summary of the cyberframe branch */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated cyberFrame */
  cyberFrame: IdType;
  /** When the cyberframe branch was created */
  createdAt: Date;
}

type HydratedICyberFrameBranch = HydratedDocument<
  Omit<ICyberFrameBranch<string>, 'cyberFrame'> & {
    cyberFrame: HydratedICyberFrame | ObjectId;
    nodes?: HydratedINode[];
  }
>;

type LeanICyberFrameBranch = Omit<Lean<ICyberFrameBranch<string>>, 'cyberFrame'> & {
  cyberFrame: ICyberFrame;
  nodes?: LeanINode[];
};

const cyberFrameBranchSchema = new Schema<ICyberFrameBranch<ObjectId>>(
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

const CyberFrameBranchModel = (): Model<ICyberFrameBranch<ObjectId>> =>
  model('CyberFrameBranch', cyberFrameBranchSchema);

export {
  CyberFrameBranchModel,
  type HydratedICyberFrameBranch,
  type ICyberFrameBranch,
  type LeanICyberFrameBranch,
};
