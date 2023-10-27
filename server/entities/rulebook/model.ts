import { model, type Model, Schema, type ObjectId, type HydratedDocument } from 'mongoose';
import { type IRuleBookType } from '../index';

interface IRuleBook {
  /** The title of the ruleBook */
  title: string
  /** A summary of the ruleBook */
  summary: string
  /** The rulebook type */
  type: ObjectId | null
  /** When the ruleBook was created */
  createdAt: Date
}

interface HydratedIRuleBook extends Omit<HydratedDocument<IRuleBook>, 'type'> {
  type: IRuleBookType
}

const ruleBookSchema = new Schema<IRuleBook>({
  title: String,
  summary: String,
  type: {
    type: Schema.Types.ObjectId,
    ref: 'RuleBookType'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RuleBookModel = (): Model<IRuleBook> => model('RuleBook', ruleBookSchema);

export { type IRuleBook, type HydratedIRuleBook, RuleBookModel };
