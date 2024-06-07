import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IArmor } from '../../armor/model';

interface IBodyArmor {
  /** When the body was created */
  createdAt: Date;
  /** The body targeted */
  body: ObjectId;
  /** The linked Armor */
  armor: ObjectId;
  /** The bag that store this armor */
  bag: ObjectId;
  /** Is the armor equiped ? */
  equiped: boolean;
}

interface HydratedIBodyArmor extends Omit<HydratedDocument<IBodyArmor>, 'armor'> {
  armor: HydratedDocument<IArmor>;
}

const BodyArmorSchema = new Schema<IBodyArmor>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body',
  },
  armor: {
    type: Schema.Types.ObjectId,
    ref: 'Armor',
  },
  bag: {
    type: Schema.Types.ObjectId,
    ref: 'BodyBag',
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

const BodyArmorModel = (): Model<IBodyArmor> => model('BodyArmor', BodyArmorSchema);

export { BodyArmorModel, type HydratedIBodyArmor, type IBodyArmor };
