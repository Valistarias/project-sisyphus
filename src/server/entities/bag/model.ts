import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

interface IBag {
  /** The title of the bag */
  title: string;
  /** A summary of the bag */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the bag */
  rarity: ObjectId;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option';
  /** The type of item */
  itemType: ObjectId;
  /** The range of the item storable in the bag */
  storableItemTypes: ObjectId[];
  /** The item modifiers of the bag */
  itemModifiers?: ObjectId[];
  /** How many item it can store */
  size: number;
  /** The cost of the bag */
  cost: number;
  /** When the bag was created */
  createdAt: Date;
}

type HydratedIBag = HydratedDocument<IBag>;

const bagSchema = new Schema<IBag>({
  title: String,
  summary: String,
  size: Number,
  i18n: String,
  rarity: {
    type: Schema.Types.ObjectId,
    ref: 'Rarity',
  },
  starterKit: {
    type: String,
    default: 'never',
  },
  itemType: {
    type: Schema.Types.ObjectId,
    ref: 'ItemType',
  },
  storableItemTypes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ItemType',
    },
  ],
  itemModifiers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ItemModifier',
    },
  ],
  cost: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BagModel = (): Model<IBag> => model('Bag', bagSchema);

export { BagModel, type HydratedIBag, type IBag };
