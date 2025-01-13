import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IStat {
  /** The title of the stat */
  title: string
  /** A summary of the stat */
  summary: string
  /** A 3 letter string used for the formulas */
  formulaId: string
  /** A short version of the stat */
  short: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** When the stat was created */
  createdAt: Date
}

type HydratedIStat = HydratedDocument<IStat>;

const statSchema = new Schema<IStat>({
  title: String,
  summary: String,
  formulaId: String,
  short: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const StatModel = (): Model<IStat> => model('Stat', statSchema);

export { StatModel, type HydratedIStat, type IStat };
