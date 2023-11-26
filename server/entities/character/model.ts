import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { ICampaign } from '../campaign/model';
import type { IUser } from '../user/model';

interface ICharacter {
  /** The name of the character */
  name: string;
  /** When the character was created */
  createdAt: Date;
  /** The player of the character */
  player: ObjectId;
  /** The campaign where the character plays */
  campaign?: ObjectId;
}

interface HydratedICharacter extends Omit<HydratedDocument<ICharacter>, 'player' | 'campaign'> {
  player: HydratedDocument<IUser>;
  campaign?: HydratedDocument<ICampaign>;
}

const CharacterSchema = new Schema<ICharacter>({
  name: String,
  player: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CharacterModel = (): Model<ICharacter> => model('Character', CharacterSchema);

export { CharacterModel, type HydratedICharacter, type ICharacter };
