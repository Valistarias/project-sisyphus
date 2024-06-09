import { type ICampaign } from './campaign';
import { type InternationalizationType, type IUser } from './global';
import { type IBackground, type INode } from './rules';

// Body Stat ------------------------------------
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

// Body Ammo ------------------------------------
export interface IBodyAmmo {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Ammo */
  ammo: string;
  /** The bag that store this ammo */
  bag: string;
  /** How many ammos the player have */
  qty: number;
  /** When the body was created */
  createdAt: Date;
}

// Body Armor ------------------------------------
export interface IBodyArmor {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Armor */
  armor: string;
  /** The bag that store this armor */
  bag: string;
  /** Is the armor equiped ? */
  equiped: boolean;
  /** When the body was created */
  createdAt: Date;
}

// Body Bag ------------------------------------
export interface IBodyBag {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Bag */
  bag: string;
  /** Is the bag equiped ? */
  equiped: boolean;
  /** When the body was created */
  createdAt: Date;
}

// Body Implant ------------------------------------
export interface IBodyImplant {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Implant */
  implant: string;
  /** The bag that store this implant */
  bag: string;
  /** at what part the implant is equiped ? */
  equiped: string;
  /** When the body was created */
  createdAt: Date;
}

// Body Item ------------------------------------
export interface IBodyItem {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Item */
  item: string;
  /** The bag that store this item */
  bag: string;
  /** How many items the player have */
  qty: number;
  /** When the body was created */
  createdAt: Date;
}

// Body Program ------------------------------------
export interface IBodyProgram {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Program */
  program: string;
  /** The bag that store this program */
  bag: string;
  /** How many times the progam was used in the day */
  uses: number;
  /** When the body was created */
  createdAt: Date;
}

// Body Weapon ------------------------------------
export interface IBodyWeapon {
  /** The ID of the body stat */
  _id: string;
  /** The body targeted */
  body: string;
  /** The linked Weapon */
  weapon: string;
  /** The type of ammo */
  ammo: string;
  /** The bag that store this weapon */
  bag: string;
  /** The bullets in the chamber */
  bullets: number;
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
  /** The associated ammos to this body */
  ammos?: IBodyAmmo[];
  /** The associated armors to this body */
  armors?: IBodyArmor[];
  /** The associated bags to this body */
  bags?: IBodyBag[];
  /** The associated implants to this body */
  implants?: IBodyImplant[];
  /** The associated items to this body */
  items?: IBodyItem[];
  /** The associated programs to this body */
  programs?: IBodyProgram[];
  /** The associated weapons to this body */
  weapons?: IBodyWeapon[];
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
  /** Is the character fully finished in the character editor ? */
  isReady: boolean;
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
