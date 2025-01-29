import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { HydratedIAmmo, IAmmo } from '../../ammo/model';

interface IBodyAmmo<IdType> {
  /** When the body was created */
  createdAt: Date
  /** The body targeted */
  body: IdType
  /** The linked Ammo */
  ammo: IdType
  /** The bag that store this ammo */
  bag: IdType
  /** How many ammos the player have */
  qty: number
}

type LeanIBodyAmmo = Omit<IBodyAmmo<string>, 'ammo'> & { ammo: IAmmo<string> };

type HydratedIBodyAmmo = HydratedDocument<
  Omit<IBodyAmmo<string>, 'ammo'> & { ammo: HydratedIAmmo }
>;

const BodyAmmoSchema = new Schema<IBodyAmmo<ObjectId>>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body'
  },
  ammo: {
    type: Schema.Types.ObjectId,
    ref: 'Ammo'
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

const BodyAmmoModel = (): Model<IBodyAmmo<ObjectId>> => model('BodyAmmo', BodyAmmoSchema);

export {
  BodyAmmoModel, type HydratedIBodyAmmo, type IBodyAmmo, type LeanIBodyAmmo
};
