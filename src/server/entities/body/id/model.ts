import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { ICharacter } from '../../character';
import type { HydratedIBodyAmmo, LeanIBodyAmmo } from '../ammo/model';
import type { HydratedIBodyArmor, LeanIBodyArmor } from '../armor/model';
import type { HydratedIBodyBag, LeanIBodyBag } from '../bag/model';
import type { HydratedIBodyImplant, LeanIBodyImplant } from '../implant/model';
import type { HydratedIBodyItem, LeanIBodyItem } from '../item/model';
import type { HydratedIBodyProgram, LeanIBodyProgram } from '../program/model';
import type { HydratedIBodyWeapon, LeanIBodyWeapon } from '../weapon/model';

interface IBody<IdType> {
  /** Is this body alive */
  alive: boolean;
  /** The body HP */
  hp: number;
  /** The character associated to this body */
  character: IdType;
  /** The cyberFrame associated to this body */
  cyberFrame: IdType;
  /** When the body was created */
  createdAt: Date;
}

type LeanIBody = IBody<string> & {
  ammos: LeanIBodyAmmo[];
  armors: LeanIBodyArmor[];
  bags: LeanIBodyBag[];
  implants: LeanIBodyImplant[];
  items: LeanIBodyItem[];
  programs: LeanIBodyProgram[];
  weapons: LeanIBodyWeapon[];
};

type HydratedIBody = HydratedDocument<
  Omit<IBody<string>, 'character'> & {
    character: HydratedDocument<ICharacter<string>>;
    ammos: HydratedIBodyAmmo[];
    armors: HydratedIBodyArmor[];
    bags: HydratedIBodyBag[];
    implants: HydratedIBodyImplant[];
    items: HydratedIBodyItem[];
    programs: HydratedIBodyProgram[];
    weapons: HydratedIBodyWeapon[];
  }
>;

const bodySchema = new Schema<IBody<ObjectId>>({
  alive: {
    type: Boolean,
    default: true,
  },
  hp: Number,
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
  },
  cyberFrame: {
    type: Schema.Types.ObjectId,
    ref: 'CyberFrame',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtuals -------------------------

bodySchema.virtual('skills', {
  ref: 'BodySkill',
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

const BodyModel = (): Model<IBody<ObjectId>> => model('Body', bodySchema);

export { BodyModel, type HydratedIBody, type IBody, type LeanIBody };
