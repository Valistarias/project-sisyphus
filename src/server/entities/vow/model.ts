import { type ObjectId, Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IVow {
  /** The title of the vow */
  title: string;
  /** A summary of the vow */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated Clergy */
  clergy: ObjectId | string;
  /** When the vow was created */
  createdAt: Date;
}

type HydratedIVow = HydratedDocument<IVow>;

const vowSchema = new Schema<IVow>({
  title: String,
  summary: String,
  i18n: String,
  clergy: {
    type: Schema.Types.ObjectId,
    ref: 'Clergy',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VowModel = (): Model<IVow> => model('Vow', vowSchema);

export { VowModel, type HydratedIVow, type IVow };
