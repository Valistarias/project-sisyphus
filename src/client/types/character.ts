import { type ICampaign } from './campaign';
import { type InternationalizationType, type IUser } from './global';

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

// Body Part ------------------------------------
export interface IBodyPart {
  /** The ID of the weapon scope */
  _id: string;
  /** The title of the weapon scope */
  title: string;
  /** A summary of the weapon scope */
  summary: string;
  /** A 3 letter string used for displaying properly */
  partId: string;
  /** How many implants a user can have on this body part */
  limit: number;
  /** When the weapon scope was created */
  createdAt: Date;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedBodyPart {
  i18n: InternationalizationType;
  bodyPart: IBodyPart;
}
