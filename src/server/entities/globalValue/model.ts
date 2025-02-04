import { Schema, model, type Model } from 'mongoose';

interface IGlobalValue {
  /** A string as name of the global value (never displayed as is, used for data) */
  name: string;
  /** The value of the parameter */
  value: string;
}

const GlobalValueSchema = new Schema<IGlobalValue>({
  name: String,
  value: String,
});

const GlobalValueModel = (): Model<IGlobalValue> => model('GlobalValue', GlobalValueSchema);

export { GlobalValueModel, type IGlobalValue };
