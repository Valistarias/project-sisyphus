import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { IDamageType } from '../damageType/model';

interface IDamage {
  /** The associated damageType */
  damageType: ObjectId;
  /** The dices formula of the damage (ex: 2d6 + 1) */
  dices: string;
  /** When the damageType branch was created */
  createdAt: Date;
}

type HydratedIDamage = HydratedDocument<
  Omit<IDamage, 'damageType'> & {
    damageType: IDamageType;
  }
>;

const damageSchema = new Schema<IDamage>({
  damageType: {
    type: Schema.Types.ObjectId,
    ref: 'DamageType',
  },
  dices: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DamageModel = (): Model<IDamage> => model('Damage', damageSchema);

export { DamageModel, type HydratedIDamage, type IDamage };
