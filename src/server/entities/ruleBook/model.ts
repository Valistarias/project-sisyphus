import { model, Schema, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { HydratedIChapter, INotion, IRuleBookType } from '../index';

interface IRuleBook {
  /** The title of the ruleBook */
  title: string
  /** A summary of the ruleBook */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The rulebook type */
  type: ObjectId | null
  /** Is the rulebook a draft ? */
  draft: boolean
  /** Is the rulebook archived ? */
  archived: boolean
  /** When the ruleBook was created */
  createdAt: Date
}

type BasicHydratedIRuleBook = HydratedDocument<
  Omit<IRuleBook, 'type'> & {
    type: IRuleBookType
  }
>;

type HydratedIRuleBook = HydratedDocument<
  Omit<IRuleBook, 'type'> & {
    type: IRuleBookType
    notions: INotion[]
    chapters: HydratedIChapter[]
  }
>;

const ruleBookSchema = new Schema<IRuleBook>(
  {
    title: String,
    summary: String,
    i18n: String,
    type: {
      type: Schema.Types.ObjectId,
      ref: 'RuleBookType'
    },
    draft: {
      type: Boolean,
      default: true
    },
    archived: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toJSON: { virtuals: true },
    // So `console.log()` and other functions that use `toObject()` include virtuals
    toObject: { virtuals: true }
  }
);

// Virtuals -------------------------

ruleBookSchema.virtual('notions', {
  ref: 'Notion',
  localField: '_id',
  foreignField: 'ruleBook'
});

ruleBookSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'ruleBook'
});

const RuleBookModel = (): Model<IRuleBook> => model('RuleBook', ruleBookSchema);

export { RuleBookModel, type BasicHydratedIRuleBook, type HydratedIRuleBook, type IRuleBook };
