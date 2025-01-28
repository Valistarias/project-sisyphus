import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { HydratedIAmmo } from '../../ammo/model';

interface IBodyAmmo {
  /** When the body was created */
  createdAt: Date
  /** The body targeted */
  body: ObjectId
  /** The linked Ammo */
  ammo: ObjectId
  /** The bag that store this ammo */
  bag: ObjectId
  /** How many ammos the player have */
  qty: number
}

type HydratedIBodyAmmo = HydratedDocument<
  Omit<IBodyAmmo, 'ammo'> & { ammo: HydratedIAmmo }
>;

const BodyAmmoSchema = new Schema<IBodyAmmo>({
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

const BodyAmmoModel = (): Model<IBodyAmmo> => model('BodyAmmo', BodyAmmoSchema);

export {
  BodyAmmoModel, type HydratedIBodyAmmo, type IBodyAmmo
};
