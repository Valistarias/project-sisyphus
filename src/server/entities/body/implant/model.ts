import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { IImplant } from '../../implant/model';

interface IBodyImplant {
  /** When the body was created */
  createdAt: Date
  /** The body targeted */
  body: ObjectId
  /** The linked Implant */
  implant: ObjectId
  /** The bag that store this implant */
  bag: ObjectId
  /** at what part the implant is equiped ? */
  equiped: ObjectId
}

type HydratedIBodyImplant = HydratedDocument<
  Omit<IBodyImplant, 'implant'> & { implant: HydratedDocument<IImplant> }
>;

const BodyImplantSchema = new Schema<IBodyImplant>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body'
  },
  implant: {
    type: Schema.Types.ObjectId,
    ref: 'Implant'
  },
  bag: {
    type: Schema.Types.ObjectId,
    ref: 'BodyBag'
  },
  equiped: {
    type: Schema.Types.ObjectId,
    ref: 'BodyPart'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BodyImplantModel = (): Model<IBodyImplant> => model('BodyImplant', BodyImplantSchema);

export {
  BodyImplantModel, type HydratedIBodyImplant, type IBodyImplant
};
