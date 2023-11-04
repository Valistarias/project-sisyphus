import { model, type Model, Schema, type ObjectId, type HydratedDocument } from 'mongoose';
import { type INotion, type IRuleBookType } from '../index';

interface IRuleBook {
  /** The title of the ruleBook */
  title: string;
  /** A summary of the ruleBook */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rulebook type */
  type: ObjectId | null;
  /** When the ruleBook was created */
  createdAt: Date;
}

interface HydratedIRuleBook extends Omit<HydratedDocument<IRuleBook>, 'type'> {
  type: IRuleBookType;
  notions: INotion[];
}

const ruleBookSchema = new Schema<IRuleBook>(
  {
    title: String,
    summary: String,
    i18n: String,
    type: {
      type: Schema.Types.ObjectId,
      ref: 'RuleBookType',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toJSON: { virtuals: true },
    // So `console.log()` and other functions that use `toObject()` include virtuals
    toObject: { virtuals: true },
  }
);

// Virtuals -------------------------

ruleBookSchema.virtual('notions', {
  ref: 'Notion',
  localField: '_id',
  foreignField: 'ruleBook',
});

const RuleBookModel = (): Model<IRuleBook> => model('RuleBook', ruleBookSchema);

export { type IRuleBook, type HydratedIRuleBook, RuleBookModel };
