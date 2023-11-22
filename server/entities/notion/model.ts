import { model, type Model, Schema, type ObjectId, type HydratedDocument } from 'mongoose';
import { type HydratedIRuleBook } from '../ruleBook/model';

interface INotion {
  /** The title of the notion */
  title: string;
  /** The content of the notion */
  text: string;
  /**
   * The rulebook associated with this notion
   * (you need to have unlocked this rulebook to see this notion)
   */
  ruleBook: ObjectId;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the notion was created */
  createdAt: Date;
}

interface HydratedNotion extends Omit<HydratedDocument<INotion>, 'ruleBook'> {
  ruleBook: HydratedIRuleBook;
}

const notionSchema = new Schema<INotion>({
  title: String,
  text: String,
  i18n: String,
  ruleBook: {
    type: Schema.Types.ObjectId,
    ref: 'RuleBook',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NotionModel = (): Model<INotion> => model('Notion', notionSchema);

export { type INotion, type HydratedNotion, NotionModel };
