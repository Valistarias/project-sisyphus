import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IEffect {
  /** The title of the effect */
  title: string;
  /** A summary of the effect */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The formula for the effect */
  formula?: string;
  /** When the effect was created */
  createdAt: Date;
}

interface HydratedIEffect extends HydratedDocument<IEffect> {}

const effectSchema = new Schema<IEffect>({
  title: String,
  summary: String,
  i18n: String,
  formula: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EffectModel = (): Model<IEffect> => model('Effect', effectSchema);

export { EffectModel, type HydratedIEffect, type IEffect };
