import type { InternationalizationType, IUser } from './global';

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
