import type { InternationalizationType, IUser } from './global';

// Arcane ------------------------------------
export interface IArcane {
  /** The ID of the arcane */
  _id: string;
  /** The title of the arcane */
  title: string;
  /** A summary of the arcane */
  summary: string;
  /** The number on the arcane */
  number: number;
  /** When the arcane was created */
  createdAt: Date;
  /** The internationalization */
  i18n: InternationalizationType;
}

export interface ICuratedArcane {
  i18n: InternationalizationType;
  arcane: IArcane;
}

export type ICard =
  | ICuratedArcane
  | {
      suit?: string;
      number?: number;
      hiddenCard: boolean;
    };

export type IDeck = ICard[];

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
  /** The deck associated with the campaign */
  deck: IDeck;
  /** The discard pile associated with the cvampaign */
  discard: IDeck;
}
