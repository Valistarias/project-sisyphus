import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IStat {
  /** The title of the stat */
  title: string;
  /** A summary of the stat */
  summary: string;
  /** A short version of the stat */
  short: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the stat was created */
  createdAt: Date;
}

interface HydratedIStat extends HydratedDocument<IStat> {}

const effectSchema = new Schema<IStat>({
  title: String,
  summary: String,
  short: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StatModel = (): Model<IStat> => model('Stat', effectSchema);

export { StatModel, type HydratedIStat, type IStat };
