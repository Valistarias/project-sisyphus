import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IWeaponStyle } from '../weaponStyle/model';

interface IWeaponType {
  /** The title of the weapon style */
  title: string;
  /** A summary of the weapon style */
  summary: string;
  /** The associated weapon style */
  weaponStyle: ObjectId;
  /** The icon of the weapon */
  icon: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the weapon style was created */
  createdAt: Date;
}

interface HydratedIWeaponType extends Omit<HydratedDocument<IWeaponType>, 'weaponStyle'> {
  weaponStyle: IWeaponStyle;
}

const userSchema = new Schema<IWeaponType>({
  title: String,
  summary: String,
  icon: String,
  weaponStyle: {
    type: Schema.Types.ObjectId,
    ref: 'WeaponStyle',
  },
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeaponTypeModel = (): Model<IWeaponType> => model('WeaponType', userSchema);

export { WeaponTypeModel, type HydratedIWeaponType, type IWeaponType };
