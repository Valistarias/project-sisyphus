import { Schema, model, type Model } from 'mongoose';

interface IItemType {
  /** A 3 letter string as name of the item type (never displayed as is) */
  name: string
}

const ItemTypeSchema = new Schema<IItemType>({
  name: String
});

const ItemTypeModel = (): Model<IItemType> => model('ItemType', ItemTypeSchema);

export { ItemTypeModel, type IItemType };
