import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { ICharacter } from '../../character';
import type { HydratedIBodyAmmo } from '../ammo/model';
import type { HydratedIBodyArmor } from '../armor/model';
import type { HydratedIBodyBag } from '../bag/model';
import type { HydratedIBodyImplant } from '../implant/model';
import type { HydratedIBodyItem } from '../item/model';
import type { HydratedIBodyProgram } from '../program/model';
import type { HydratedIBodyStat } from '../stat/model';
import type { HydratedIBodyWeapon } from '../weapon/model';

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

type HydratedIBody = HydratedDocument<
  Omit<IBody, 'character'> & {
    character: HydratedDocument<ICharacter>;
    stats: HydratedIBodyStat[];
    ammos: HydratedIBodyAmmo[];
    armors: HydratedIBodyArmor[];
    bags: HydratedIBodyBag[];
    implants: HydratedIBodyImplant[];
    items: HydratedIBodyItem[];
    programs: HydratedIBodyProgram[];
    weapons: HydratedIBodyWeapon[];
  }
>;

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

bodySchema.virtual('ammos', {
  ref: 'BodyAmmo',
  localField: '_id',
  foreignField: 'body',
});

bodySchema.virtual('armors', {
  ref: 'BodyArmor',
  localField: '_id',
  foreignField: 'body',
});

bodySchema.virtual('bags', {
  ref: 'BodyBag',
  localField: '_id',
  foreignField: 'body',
});

bodySchema.virtual('implants', {
  ref: 'BodyImplant',
  localField: '_id',
  foreignField: 'body',
});

bodySchema.virtual('items', {
  ref: 'BodyItem',
  localField: '_id',
  foreignField: 'body',
});

bodySchema.virtual('programs', {
  ref: 'BodyProgram',
  localField: '_id',
  foreignField: 'body',
});

bodySchema.virtual('weapons', {
  ref: 'BodyWeapon',
  localField: '_id',
  foreignField: 'body',
});

const BodyModel = (): Model<IBody> => model('Body', bodySchema);

export { BodyModel, type HydratedIBody, type IBody };
