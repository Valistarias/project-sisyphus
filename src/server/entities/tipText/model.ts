import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface ITipText {
  /** The title of the tip text */
  title: string
  /** A summary of the tip text */
  summary: string
  /** A string used for identifying and displaying the right tip */
  tipId: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** When the tip text was created */
  createdAt: Date
}

type HydratedITipText = HydratedDocument<ITipText>;

const tipTextSchema = new Schema<ITipText>({
  title: String,
  summary: String,
  tipId: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TipTextModel = (): Model<ITipText> => model('TipText', tipTextSchema);

export { TipTextModel, type HydratedITipText, type ITipText };
