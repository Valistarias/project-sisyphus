import { type ICampaign } from './campaign';
import { type IUser } from './global';

// Character ------------------------------------
export interface ICharacter {
  /** The ID of the character */
  _id: string;
  /** The name of the character */
  name: string;
  /** The owner of the character */
  player: IUser;
  /** The players of the character */
  campaign: ICampaign;
  /** When the character was created */
  createdAt: Date;
}
