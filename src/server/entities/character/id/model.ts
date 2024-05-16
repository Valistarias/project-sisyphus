import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type HydratedINode } from '../../node/model';

import type { ICampaign } from '../../campaign/model';
import type { IUser } from '../../user/model';

interface ICharacter {
  /** The name of the character */
  name?: string;
  /** When the character was created */
  createdAt: Date;
  /** The player of the character */
  player?: ObjectId;
  /** Who has created this character */
  createdBy: ObjectId;
  /** The campaign where the character plays */
  campaign?: ObjectId;
}

interface HydratedICharacter
  extends Omit<HydratedDocument<ICharacter>, 'player' | 'campaign' | 'createdBy'> {
  player?: HydratedDocument<IUser>;
  createdBy: HydratedDocument<IUser>;
  campaign?: HydratedDocument<ICampaign>;
  nodes?: HydratedINode[];
}

const characterSchema = new Schema<ICharacter>(
  {
    name: String,
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals -------------------------

characterSchema.virtual('nodes', {
  ref: 'CharacterNode',
  localField: '_id',
  foreignField: 'character',
});

const CharacterModel = (): Model<ICharacter> => model('Character', characterSchema);

export { CharacterModel, type HydratedICharacter, type ICharacter };
