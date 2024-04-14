import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface ICharParam {
  /** The title of the Character Param */
  title: string;
  /** A summary of the Character Param */
  summary: string;
  /** A short version of the Character Param */
  short: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the Character Param was created */
  createdAt: Date;
}

interface HydratedICharParam extends HydratedDocument<ICharParam> {}

const charParamSchema = new Schema<ICharParam>({
  title: String,
  summary: String,
  short: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CharParamModel = (): Model<ICharParam> => model('CharParam', charParamSchema);

export { CharParamModel, type HydratedICharParam, type ICharParam };
