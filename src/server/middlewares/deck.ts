import type { InternationalizationType } from '../utils/types';

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

class Deck {
  deck: IDeck;

  constructor(isOwner: boolean, content?: string) {
    if (content === undefined) {
      // We need to create a new Deck
    }
    if (content === '') {
      // The deck is empty
      this.deck = [];
    }
    // Constructor parameters
    const suits = ['wisdom', 'courage', 'justice', 'temperance'];
    const nbCardPerSuit = 10;
  }

  // hello(familiar) {
  //   if(familiar) {
  //     console.log(`Yo fam ! I'm ${this.surName} ${this.name} and I'm ${this.age}`)
  //   } else {
  //     console.log(`Hello ! My name is ${this.surName} ${this.name} and I have ${this.age} years old`)
  //   }
  // }
}

export { Deck };
