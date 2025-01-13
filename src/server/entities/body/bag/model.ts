import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { IBag } from '../../bag/model';

interface IBodyBag {
  /** When the body was created */
  createdAt: Date;
  /** The body targeted */
  body: ObjectId;
  /** The linked Bag */
  bag: ObjectId;
  /** Is the bag equiped ? */
  equiped: boolean;
}

type HydratedIBodyBag = HydratedDocument<
  Omit<IBodyBag, 'bag'> & {
    bag: HydratedDocument<IBag>;
  }
>;

const BodyBagSchema = new Schema<IBodyBag>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body',
  },
  bag: {
    type: Schema.Types.ObjectId,
    ref: 'Bag',
  },
  equiped: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BodyBagModel = (): Model<IBodyBag> => model('BodyBag', BodyBagSchema);

export { BodyBagModel, type HydratedIBodyBag, type IBodyBag };
