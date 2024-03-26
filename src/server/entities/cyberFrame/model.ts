import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IRuleBook } from '../index';

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

interface HydratedICyberFrame extends Omit<HydratedDocument<ICyberFrame>, 'ruleBook'> {
  ruleBook: IRuleBook;
}

const effectSchema = new Schema<ICyberFrame>({
  title: String,
  summary: String,
  i18n: String,
  ruleBook: {
    type: Schema.Types.ObjectId,
    ref: 'Stat',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CyberFrameModel = (): Model<ICyberFrame> => model('CyberFrame', effectSchema);

export { CyberFrameModel, type HydratedICyberFrame, type ICyberFrame };
