import type { LeanIArcane } from '../entities/arcane/model';

// Arcane ------------------------------------

export type ICard =
  | {
      _id: string;
    }
  | {
      suit: string;
      number: number;
    }
  | {
      hidden: true;
    };

export type IDeck = ICard[];

class Deck {
  deck: IDeck;
  deckToString: string;

  constructor(content?: string, arcanes?: LeanIArcane[]) {
    if (content === undefined) {
      // We need to create a new Deck

      // Constructor parameters
      const suits = ['wisdom', 'courage', 'justice', 'temperance'];
      const nbCardPerSuit = 10;

      const newDeck: IDeck = [];

      suits.forEach((suit) => {
        for (let index = 0; index < nbCardPerSuit; index++) {
          newDeck.push({
            suit,
            number: index + 1,
          });
        }
      });

      arcanes?.forEach((arcane) => newDeck.push({ _id: String(arcane._id) }));

      this.deck = newDeck;
      this.deckToString = JSON.stringify(newDeck);
    } else if (content === '') {
      // The deck is empty
      this.deck = [];
    } else {
      // The deck is a string, to be transformed
      this.deckToString = content;
      this.deck = JSON.parse(content);
    }
  }

  shuffle(): void {
    this.deck = this.deck.reduce(
      (card, _, i) => {
        const random = Math.floor(Math.random() * (card.length - i)) + i;
        [card[i], card[random]] = [card[random], card[i]];

        return card;
      },
      [...this.deck]
    );
    this.deckToString = JSON.stringify(this.deck);
  }

  draw(n: number): ICard[] {
    return this.deck.slice(0, n);
  }

  hideIfUser(isOwner: boolean): void {
    if (!isOwner) {
      this.deck = this.deck.map((card) => ({
        hidden: true,
      }));
      this.deckToString = JSON.stringify(this.deck);
    }
  }
}

export { Deck };
