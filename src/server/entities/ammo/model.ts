import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

interface IAmmo<IdType> {
  /** The title of the ammo */
  title: string;
  /** A summary of the ammo */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the ammo */
  rarity: IdType;
  /** The type of item */
  itemType: IdType;
  /** All the weapons that can use this type of ammo */
  weaponTypes?: IdType[];
  /** The item modifiers of the ammo */
  itemModifiers?: IdType[];
  /** How this bullet impact the hit roll */
  offsetToHit?: number;
  /** How this bullet impact the damage score */
  offsetDamage?: number;
  /** The cost of a single element */
  cost: number;
  /** When the ammo was created */
  createdAt: Date;
}

type HydratedIAmmo = HydratedDocument<IAmmo<string>>;

const ammoSchema = new Schema<IAmmo<ObjectId>>({
  title: String,
  summary: String,
  offsetToHit: Number,
  offsetDamage: Number,
  i18n: String,
  rarity: {
    type: Schema.Types.ObjectId,
    ref: 'Rarity',
  },
  itemType: {
    type: Schema.Types.ObjectId,
    ref: 'ItemType',
  },
  weaponTypes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'WeaponType',
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

const AmmoModel = (): Model<IAmmo<ObjectId>> => model('Ammo', ammoSchema);

export { AmmoModel, type HydratedIAmmo, type IAmmo };
