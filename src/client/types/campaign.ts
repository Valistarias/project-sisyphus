import { type IUser } from './global';

// Campaign ------------------------------------
export interface ICampaign {
  /** The ID of the campaign */
  _id: string;
  /** The name of the campaign */
  name: string;
  /** The code of the campaign to connect to it */
  code: string;
  /** The owner of the campaign */
  owner: IUser;
  /** The players of the campaign */
  players: IUser[];
  /** When the campaign was created */
  createdAt: Date;
}
