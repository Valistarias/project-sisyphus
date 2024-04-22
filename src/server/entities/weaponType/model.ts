import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IItemType } from '../itemType/model';
import { type IWeaponStyle } from '../weaponStyle/model';

interface IWeaponType {
  /** The title of the weapon style */
  title: string;
  /** A summary of the weapon style */
  summary: string;
  /** The associated weapon style */
  weaponStyle: ObjectId;
  /** The type of item */
  itemType: ObjectId;
  /** The icon of the weapon */
  icon: string;
  /** Is this weapon type needs training to be used ? */
  needTraining: boolean;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the weapon style was created */
  createdAt: Date;
}

interface HydratedIWeaponType
  extends Omit<HydratedDocument<IWeaponType>, 'weaponStyle' | 'itemType'> {
  weaponStyle: IWeaponStyle;
  itemType: IItemType;
}

const userSchema = new Schema<IWeaponType>({
  title: String,
  summary: String,
  icon: String,
  needTraining: {
    type: Boolean,
    default: false,
  },
  weaponStyle: {
    type: Schema.Types.ObjectId,
    ref: 'WeaponStyle',
  },
  itemType: {
    type: Schema.Types.ObjectId,
    ref: 'ItemType',
  },
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeaponTypeModel = (): Model<IWeaponType> => model('WeaponType', userSchema);

export { WeaponTypeModel, type HydratedIWeaponType, type IWeaponType };
