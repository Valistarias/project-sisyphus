import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type ICharacter } from '../../character';
import { type HydratedIBodyStat } from '../stat/model';

interface IBody {
  /** Is this body alive */
  alive: boolean;
  /** The body HP */
  hp: number;
  /** The character associated to this body */
  character: ObjectId;
  /** When the body was created */
  createdAt: Date;
}

interface HydratedIBody extends Omit<HydratedDocument<IBody>, 'character'> {
  character: HydratedDocument<ICharacter>;
  stats: HydratedIBodyStat[];
}

const bodySchema = new Schema<IBody>({
  alive: {
    type: Boolean,
    default: true,
  },
  hp: Number,
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtuals -------------------------

bodySchema.virtual('stats', {
  ref: 'BodyStat',
  localField: '_id',
  foreignField: 'body',
});

const BodyModel = (): Model<IBody> => model('Body', bodySchema);

export { BodyModel, type HydratedIBody, type IBody };
