import { type ICampaign } from './campaign';
import { type InternationalizationType, type IUser } from './global';
import { type IBackground, type INode } from './rules';

// Body Stats ------------------------------------
export interface IBodyStat {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Stat */
  stat: string;
  /** What is the actual value of this stat */
  value: number;
  /** When the body was created */
  createdAt: Date;
}

// Body ------------------------------------
export interface IBody {
  /** The ID of the body */
  _id: string;
  /** Is this body alive */
  alive: boolean;
  /** The body HP */
  hp: number;
  /** The character associated to this body */
  character: string;
  /** The associated stats to this body */
  stats: IBodyStat[];
  /** When the body was created */
  createdAt: Date;
}

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
  /** The first name of the character */
  firstName?: string;
  /** The last name of the character */
  lastName?: string;
  /** The nickname of the character */
  nickName?: string;
  /** The money of the character */
  money?: number;
  /** The karma of the character */
  karma?: number;
  /** The owner of the character */
  player?: IUser;
  /** The creator of the character */
  createdBy: IUser;
  /** The players of the character */
  campaign?: ICampaign;
  /** The nodes of the character */
  nodes?: ICharacterNode[];
  /** All the bodies used by this character */
  bodies?: IBody[];
  /** The background of the character */
  background?: IBackground;
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
