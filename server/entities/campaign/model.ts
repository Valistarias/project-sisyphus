import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { IUser } from '../user/model';

interface ICampaign {
  /** The name of the campaign */
  name: string;
  /** The code to join the campaign */
  code: string;
  /** When the campaign was created */
  createdAt: Date;
  /** The owner of the campaign */
  owner: string | ObjectId;
  /** The players in the campaign */
  players: string[] | ObjectId[];
}

interface HydratedICampaign extends Omit<HydratedDocument<ICampaign>, 'owner' | 'players'> {
  owner: IUser;
  players: IUser[];
}

const CampaignSchema = new Schema<ICampaign>({
  name: String,
  code: String,
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
});

const CampaignModel = (): Model<ICampaign> => model('Campaign', CampaignSchema);

export { CampaignModel, type HydratedICampaign, type ICampaign };
