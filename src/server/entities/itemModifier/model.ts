import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IItemModifier {
  /** The title of the item modifier */
  title: string
  /** A summary of the item modifier */
  summary: string
  /** A 3 letter string used for displaying accurate effects */
  modifierId: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** When the item modifier was created */
  createdAt: Date
}

type HydratedIItemModifier = HydratedDocument<IItemModifier>;

const userSchema = new Schema<IItemModifier>({
  title: String,
  summary: String,
  modifierId: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ItemModifierModel = (): Model<IItemModifier> => model('ItemModifier', userSchema);

export { ItemModifierModel, type HydratedIItemModifier, type IItemModifier };
