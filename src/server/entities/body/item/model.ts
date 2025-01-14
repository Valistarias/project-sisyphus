import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { IItem } from '../../item/model';

interface IBodyItem {
  /** When the body was created */
  createdAt: Date
  /** The body targeted */
  body: ObjectId
  /** The linked Item */
  item: ObjectId
  /** The bag that store this item */
  bag: ObjectId
  /** How many items the player have */
  qty: number
}

type HydratedIBodyItem = HydratedDocument<
  Omit<IBodyItem, 'item'> & { item: HydratedDocument<IItem> }
>;

const BodyItemSchema = new Schema<IBodyItem>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body'
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item'
  },
  bag: {
    type: Schema.Types.ObjectId,
    ref: 'BodyBag'
  },
  qty: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BodyItemModel = (): Model<IBodyItem> => model('BodyItem', BodyItemSchema);

export {
  BodyItemModel, type HydratedIBodyItem, type IBodyItem
};
