import { type ObjectId, Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { Lean } from '../../../utils/types';
import type { HydratedIBody, LeanIBody } from '../../body';
import type { ICampaign } from '../../campaign/model';
import type { IUser } from '../../user/model';
import type { HydratedIVow, LeanIVow } from '../../vow/model';
import type { HydratedICharacterNode, LeanICharacterNode } from '../node/model';
import type { HydratedICharacterStat, ICharacterStat } from '../stat/model';

interface ICharacter<IdType> {
  /** The first name of the character */
  firstName?: string;
  /** The last name of the character */
  lastName?: string;
  /** The nickname of the character */
  nickName?: string;
  /** The gender of the character */
  gender?: string;
  /** The pronouns of the character */
  pronouns?: string;
  /** The bio of the character */
  bio?: string;
  /** The money of the character */
  money?: number;
  /** The karma of the character */
  karma?: number;
  /** The level of the character */
  level?: number;
  /** The player's hand */
  hand?: string;
  /** Is the character fully finished in the character editor ? */
  isReady: boolean;
  /** When the character was created */
  createdAt: Date;
  /** The player of the character */
  player?: IdType;
  /** The character vows */
  vows?: IdType[];
  /** Who has created this character */
  createdBy: IdType;
  /** The campaign where the character plays */
  campaign?: IdType;
}

type LeanICharacter = Omit<
  ICharacter<string>,
  'player' | 'campaign' | 'createdBy' | 'background' | 'vows'
> & {
  player?: Lean<IUser>;
  createdBy: Lean<IUser>;
  stats: ICharacterStat[];
  campaign?: Lean<ICampaign<string>>;
  nodes?: LeanICharacterNode[];
  bodies?: LeanIBody[];
  vows: LeanIVow[];
};

type HydratedICharacter = HydratedDocument<
  Omit<ICharacter<string>, 'player' | 'campaign' | 'createdBy' | 'background' | 'vows'> & {
    player?: HydratedDocument<IUser>;
    createdBy: HydratedDocument<IUser>;
    stats: HydratedICharacterStat[];
    campaign?: HydratedDocument<ICampaign<string>>;
    nodes?: HydratedICharacterNode[];
    bodies?: HydratedIBody[];
    vows: HydratedIVow[];
  }
>;

const characterSchema = new Schema<ICharacter<ObjectId>>(
  {
    firstName: String,
    lastName: String,
    nickName: String,
    gender: String,
    pronouns: String,
    bio: String,
    hand: {
      type: String,
      default: '',
    },
    money: Number,
    karma: Number,
    level: Number,
    isReady: {
      type: Boolean,
      default: false,
    },
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vows: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Vow',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
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

characterSchema.virtual('stats', {
  ref: 'CharacterStat',
  localField: '_id',
  foreignField: 'character',
});

characterSchema.virtual('nodes', {
  ref: 'CharacterNode',
  localField: '_id',
  foreignField: 'character',
});

characterSchema.virtual('bodies', {
  ref: 'Body',
  localField: '_id',
  foreignField: 'character',
});

const CharacterModel = (): Model<ICharacter<ObjectId>> => model('Character', characterSchema);

export { CharacterModel, type HydratedICharacter, type ICharacter, type LeanICharacter };
