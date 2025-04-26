import { type ObjectId, Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { Lean } from '../../utils/types';
import type { HydratedIVow, LeanIVow } from '../vow/model';

interface IClergy<IdType> {
  /** The title of the clergy */
  title: string;
  /** A summary of the clergy */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated RuleBook */
  ruleBook: IdType;
  /** The icon of the clergy */
  icon: string;
  /** When the clergy was created */
  createdAt: Date;
}

type HydratedIClergy = HydratedDocument<IClergy<string>> & {
  vows: HydratedIVow[];
};

type LeanIClergy = Lean<IClergy<string>> & {
  vows: LeanIVow[];
};

const clergySchema = new Schema<IClergy<ObjectId>>(
  {
    title: String,
    summary: String,
    i18n: String,
    icon: String,
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

clergySchema.virtual('vows', {
  ref: 'Vow',
  localField: '_id',
  foreignField: 'clergy',
});

const ClergyModel = (): Model<IClergy<ObjectId>> => model('Clergy', clergySchema);

export { ClergyModel, type HydratedIClergy, type IClergy, type LeanIClergy };
