import {
  Schema, model, type HydratedDocument, type Model
} from 'mongoose';

interface IDamageType {
  /** The title of the damage type */
  title: string
  /** A summary of the damage type */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** When the damage type was created */
  createdAt: Date
}

type HydratedIDamageType = HydratedDocument<IDamageType>;

const damageTypeSchema = new Schema<IDamageType>({
  title: String,
  summary: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DamageTypeModel = (): Model<IDamageType> => model('DamageType', damageTypeSchema);

export {
  DamageTypeModel, type HydratedIDamageType, type IDamageType
};
