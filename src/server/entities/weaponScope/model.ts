import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IWeaponScope {
  /** The title of the weapon scope */
  title: string;
  /** A summary of the weapon scope */
  summary: string;
  /** A 3 letter string used for displaying accurate range */
  scopeId: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the weapon scope was created */
  createdAt: Date;
}

interface HydratedIWeaponScope extends HydratedDocument<IWeaponScope> {}

const userSchema = new Schema<IWeaponScope>({
  title: String,
  summary: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeaponScopeModel = (): Model<IWeaponScope> => model('WeaponScope', userSchema);

export { WeaponScopeModel, type HydratedIWeaponScope, type IWeaponScope };
