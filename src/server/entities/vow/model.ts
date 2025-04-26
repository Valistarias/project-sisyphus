import { type ObjectId, Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { Lean } from '../../utils/types';

interface IVow<IdType> {
  /** The content of the vow */
  title: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The associated Clergy */
  clergy: IdType;
  /** The position of this vow, in reference with others in a clergy */
  position: number;
  /** When the vow was created */
  createdAt: Date;
}

type HydratedIVow = HydratedDocument<IVow<string>>;

type LeanIVow = Lean<IVow<string>>;

const vowSchema = new Schema<IVow<ObjectId>>({
  title: String,
  i18n: String,
  position: Number,
  clergy: {
    type: Schema.Types.ObjectId,
    ref: 'Clergy',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VowModel = (): Model<IVow<ObjectId>> => model('Vow', vowSchema);

export { VowModel, type HydratedIVow, type IVow, type LeanIVow };
