import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { HydratedIWeapon } from '../../weapon/model';

interface IBodyWeapon {
  /** When the body was created */
  createdAt: Date
  /** The body targeted */
  body: ObjectId
  /** The linked Weapon */
  weapon: ObjectId
  /** The type of ammo */
  ammo: ObjectId
  /** The bag that store this weapon */
  bag: ObjectId
  /** The bullets in the chamber */
  bullets: number
}

type HydratedIBodyWeapon = HydratedDocument<
  Omit<IBodyWeapon, 'weapon'> & {
    weapon: HydratedIWeapon
  }
>;

const BodyWeaponSchema = new Schema<IBodyWeapon>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body'
  },
  weapon: {
    type: Schema.Types.ObjectId,
    ref: 'Weapon'
  },
  ammo: {
    type: Schema.Types.ObjectId,
    ref: 'Ammo'
  },
  bag: {
    type: Schema.Types.ObjectId,
    ref: 'BodyBag'
  },
  bullets: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BodyWeaponModel = (): Model<IBodyWeapon> => model('BodyWeapon', BodyWeaponSchema);

export {
  BodyWeaponModel, type HydratedIBodyWeapon, type IBodyWeapon
};
