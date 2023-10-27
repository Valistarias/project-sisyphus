import { model, type Model, Schema } from 'mongoose';

interface IRuleBook {
  /** The title of the ruleBook */
  title: string
  /** A summary of the ruleBook */
  summary: string
  /** When the ruleBook was created */
  createdAt: Date
}

const ruleBookSchema = new Schema<IRuleBook>({
  title: String,
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RuleBookModel = (): Model<IRuleBook> => model('RuleBook', ruleBookSchema);

export { type IRuleBook, RuleBookModel };
