import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IActionType } from '../index';

interface IEffect {
  /** The title of the effect */
  title: string;
  /** A summary of the effect */
  summary: string;
  /** The effect action type */
  type: ObjectId;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The formula for the effect */
  formula?: string;
  /** When the effect was created */
  createdAt: Date;
}

interface HydratedIEffect extends Omit<HydratedDocument<IEffect>, 'type'> {
  type: IActionType;
}

const effectSchema = new Schema<IEffect>({
  title: String,
  summary: String,
  type: {
    type: Schema.Types.ObjectId,
    ref: 'ActionType',
  },
  i18n: String,
  formula: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EffectModel = (): Model<IEffect> => model('Effect', effectSchema);

export { EffectModel, type HydratedIEffect, type IEffect };
