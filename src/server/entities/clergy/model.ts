import { type ObjectId, Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IClergy {
  /** The title of the clergy */
  title: string;
  /** A summary of the clergy */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated RuleBook */
  ruleBook: ObjectId | string;
  /** When the clergy was created */
  createdAt: Date;
}

type HydratedIClergy = HydratedDocument<IClergy>;

const clergySchema = new Schema<IClergy>({
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
});

const ClergyModel = (): Model<IClergy> => model('Clergy', clergySchema);

export { ClergyModel, type HydratedIClergy, type IClergy };
