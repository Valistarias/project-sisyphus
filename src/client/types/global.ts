import type { ICampaign } from './campaign';
import type { ICharacter } from './character';

// Global Types ------------------------------------
export type InternationalizationType = Record<
  string,
  Record<string, string | undefined> | undefined
>;
export interface ErrorResponseType {
  response: {
    data: {
      message: string;
      code: string;
      sent?: string | null;
      err?: unknown;
    };
  };
}

// User ------------------------------------
export interface IRole {
  /** The ID of the role */
  _id: string;
  /** The string associated to the role */
  name: string;
}

export interface IUser {
  /** The ID of the user */
  _id: string;
  /** The username of the user */
  username: string;
  /** The mail of the user */
  mail: string;
  /** The name of the user */
  name: string;
  /** The chosen language for the UI */
  lang: string;
  /** The chosen theme for the UI */
  theme: string;
  /** The scale of the UI */
  scale: number;
  /** Is the user verified */
  verified: boolean;
  /** Is the tips automatically displays in the character creation */
  charCreationTips: boolean;
  /** The user roles */
  roles: IRole[];
}

// Dices and CampaignEvents ------------------------------------
export type TypeDice = 4 | 6 | 8 | 10 | 12 | 20;

export type TypeCampaignEvent =
  | 'free'
  | 'hpGain'
  | 'hpLoss'
  | 'init'
  | 'weapon'
  | 'program'
  | 'damage'
  | 'heal'
  | `skill-${string}`
  | `stat-${string}`
  | `card-${string}`;

export interface ICampaignEvent {
  /** The ID of the roll */
  _id: string;
  /** The type of the roll */
  type: TypeCampaignEvent;
  /** The result of the roll, as value */
  result: number;
  /** The formula of the roll, as string */
  formula: string;
  /** The owner of the roll */
  character: ICharacter;
  /** The campaign of the roll */
  campaign: ICampaign;
  /** When the roll was executed */
  createdAt: Date;
}
