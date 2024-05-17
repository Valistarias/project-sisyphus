import { type ICampaign } from './campaign';
import { type InternationalizationType, type IUser } from './global';
import { type INode } from './rules';

// Character Nodes ------------------------------------
export interface ICharacterNode {
  /** The ID of the character node */
  _id: string;
  /** When the character was created */
  createdAt: Date;
  /** The targeted character */
  character: ICharacter;
  /** The linked Node */
  node: INode;
  /** How many time this node was used */
  used?: number;
}

// Character ------------------------------------
export interface ICharacter {
  /** The ID of the character */
  _id: string;
  /** The name of the character */
  name?: string;
  /** The owner of the character */
  player?: IUser;
  /** The creator of the character */
  createdBy: IUser;
  /** The players of the character */
  campaign?: ICampaign;
  /** The nodes of the character */
  nodes?: ICharacterNode[];
  /** When the character was created */
  createdAt: Date;
}

// Body Part ------------------------------------
export interface IBodyPart {
  /** The ID of the body part */
  _id: string;
  /** The title of the body part */
  title: string;
  /** A summary of the body part */
  summary: string;
  /** A 3 letter string used for displaying properly */
  partId: string;
  /** How many implants a user can have on this body part */
  limit: number;
  /** When the body part was created */
  createdAt: Date;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedBodyPart {
  i18n: InternationalizationType;
  bodyPart: IBodyPart;
}
