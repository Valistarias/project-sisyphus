import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { IDamageType } from '../index';

interface IEnnemyAttack {
  /** The title of the Ennemy Attack */
  title: string
  /** A summary of the Ennemy Attack */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The associated damageType */
  damageType: ObjectId
  /** The range of the attack */
  weaponScope: ObjectId | string
  /** The dices formula of the damage (ex: 2d6 + 1) */
  dices: string
  /** The bonus to roll this attack */
  bonusToHit?: number
  /** When the Ennemy Attack was created */
  createdAt: Date
}

type HydratedIEnnemyAttack = HydratedDocument<
  Omit<IEnnemyAttack, 'damageType'> & { damageType: IDamageType | string }
>;

const ennemyAttackSchema = new Schema<IEnnemyAttack>({
  title: String,
  summary: String,
  i18n: String,
  damageType: {
    type: Schema.Types.ObjectId,
    ref: 'DamageType'
  },
  weaponScope: {
    type: Schema.Types.ObjectId,
    ref: 'WeaponScope'
  },
  dices: String,
  bonusToHit: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EnnemyAttackModel = (): Model<IEnnemyAttack> => model('EnnemyAttack', ennemyAttackSchema);

export {
  EnnemyAttackModel, type HydratedIEnnemyAttack, type IEnnemyAttack
};
