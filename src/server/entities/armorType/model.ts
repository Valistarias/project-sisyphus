import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IArmorType {
  /** The title of the armor type */
  title: string
  /** A summary of the armor type */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** When the armor type was created */
  createdAt: Date
}

type HydratedIArmorType = HydratedDocument<IArmorType>;

const armorTypeSchema = new Schema<IArmorType>({
  title: String,
  summary: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ArmorTypeModel = (): Model<IArmorType> => model('ArmorType', armorTypeSchema);

export { ArmorTypeModel, type HydratedIArmorType, type IArmorType };
