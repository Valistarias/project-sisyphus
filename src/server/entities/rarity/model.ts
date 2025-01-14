import {
  Schema, model, type HydratedDocument, type Model
} from 'mongoose';

interface IRarity {
  /** The title of the rarity */
  title: string
  /** A summary of the rarity */
  summary: string
  /** The position of this rarity, in reference with others */
  position: number
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** When the rarity was created */
  createdAt: Date
}

type HydratedIRarity = HydratedDocument<IRarity>;

const userSchema = new Schema<IRarity>({
  title: String,
  summary: String,
  position: Number,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RarityModel = (): Model<IRarity> => model('Rarity', userSchema);

export {
  RarityModel, type HydratedIRarity, type IRarity
};
