import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { HydratedIBag, IBag } from '../../bag/model';

interface IBodyBag<IdType> {
  /** When the body was created */
  createdAt: Date;
  /** The body targeted */
  body: IdType;
  /** The linked Bag */
  bag: IdType;
  /** Is the bag equiped ? */
  equiped: boolean;
}

type LeanIBodyBag = Omit<IBodyBag<string>, 'bag'> & { bag: IBag<string> };

type HydratedIBodyBag = HydratedDocument<Omit<IBodyBag<string>, 'bag'> & { bag: HydratedIBag }>;

const BodyBagSchema = new Schema<IBodyBag<ObjectId>>({
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

const BodyBagModel = (): Model<IBodyBag<ObjectId>> => model('BodyBag', BodyBagSchema);

export { BodyBagModel, type HydratedIBodyBag, type IBodyBag, type LeanIBodyBag };
