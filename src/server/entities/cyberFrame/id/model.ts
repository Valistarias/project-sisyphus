import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type {
  HydratedICyberFrameCharParam,
  HydratedICyberFrameStat,
  HydratedIRuleBook,
  ICyberFrameCharParam,
  ICyberFrameStat,
  IRuleBook,
} from '../../index';

interface ICyberFrame {
  /** The title of the Character Param */
  title: string;
  /** A summary of the Character Param */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated RuleBook */
  ruleBook: ObjectId;
  /** When the Character Param was created */
  createdAt: Date;
}

type LeanICyberFrame = Omit<ICyberFrame, 'ruleBook'> & {
  ruleBook: IRuleBook;
  stats: ICyberFrameStat[];
  charParams: ICyberFrameCharParam[];
};

type HydratedICyberFrame = HydratedDocument<Omit<ICyberFrame, 'ruleBook'>> & {
  ruleBook: HydratedIRuleBook | string;
  stats: HydratedICyberFrameStat[];
  charParams: HydratedICyberFrameCharParam[];
};

const cyberFrameSchema = new Schema<ICyberFrame>(
  {
    title: String,
    summary: String,
    i18n: String,
    ruleBook: {
      type: Schema.Types.ObjectId,
      ref: 'RuleBook',
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

cyberFrameSchema.virtual('stats', {
  ref: 'CyberFrameStat',
  localField: '_id',
  foreignField: 'cyberFrame',
});

cyberFrameSchema.virtual('charParams', {
  ref: 'CyberFrameCharParam',
  localField: '_id',
  foreignField: 'cyberFrame',
});

const CyberFrameModel = (): Model<ICyberFrame> => model('CyberFrame', cyberFrameSchema);

export { CyberFrameModel, type HydratedICyberFrame, type ICyberFrame, type LeanICyberFrame };
