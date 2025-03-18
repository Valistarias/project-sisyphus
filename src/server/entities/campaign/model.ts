import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { Lean } from '../../utils/types';
import type { ICharacter } from '../character';
import type { IUser } from '../user/model';

interface ICampaign<IdType> {
  /** The name of the campaign */
  name: string;
  /** The code to join the campaign */
  code: string;
  /** The actual deck of the campaign, stringified */
  deck?: string;
  /** The discard pile of the campaign, stringified */
  discard?: string;
  /** When the campaign was created */
  createdAt: Date;
  /** The owner of the campaign */
  owner: IdType;
  /** The players in the campaign */
  players: IdType[];
}

type LeanICompleteCampaign = Lean<
  Omit<ICampaign<string>, 'owner' | 'players' | 'characters'> & {
    owner: Lean<IUser>;
    players: Array<Lean<IUser>>;
    characters: Array<Lean<ICharacter<string>>>;
  }
>;

type HydratedICompleteCampaign = HydratedDocument<
  Omit<ICampaign<string>, 'owner' | 'players' | 'characters'> & {
    owner: HydratedDocument<IUser>;
    players: Array<HydratedDocument<IUser>>;
    characters: Array<ICharacter<string>>;
  }
>;

type HydratedISimpleCampaign = HydratedDocument<
  Omit<ICampaign<string>, 'owner' | 'characters'> & { owner: HydratedDocument<IUser> }
>;

const campaignSchema = new Schema<ICampaign<ObjectId>>(
  {
    name: String,
    code: String,
    deck: {
      type: String,
      default: '',
    },
    discard: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toJSON: { virtuals: true },
    // So `console.log()` and other functions that use `toObject()` include virtuals
    toObject: { virtuals: true },
  }
);

campaignSchema.virtual('characters', {
  ref: 'Character',
  localField: '_id',
  foreignField: 'campaign',
});

const CampaignModel = (): Model<ICampaign<ObjectId>> => model('Campaign', campaignSchema);

export {
  CampaignModel,
  type HydratedICompleteCampaign,
  type HydratedISimpleCampaign,
  type ICampaign,
  type LeanICompleteCampaign,
};
