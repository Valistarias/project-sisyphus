import type { LeanIArcane } from '../entities/arcane/model';

// Arcane ------------------------------------

interface IArcanaCard {
  _id: string;
}

interface INumberCard {
  suit: string;
  number: number;
}

interface IHiddenCard {
  hidden: true;
}

export type ICard = IArcanaCard | INumberCard | IHiddenCard;

export type IDeck = ICard[];

class Deck {
  deck: IDeck;
  deckToString: string;
  discard: IDeck;
  discardToString: string;

  constructor(
    content?: {
      deck: string;
      discard: string;
    },
    arcanes?: LeanIArcane[]
  ) {
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

      this.discard = [];
      this.discardToString = JSON.stringify([]);
    } else {
      if (content.deck === '') {
        // The deck is empty
        this.deck = [];
      } else {
        // The deck is a string, to be transformed
        this.deckToString = content.deck;
        this.deck = JSON.parse(content.deck);
      }

      if (content.discard === '') {
        // The discard is empty
        this.discard = [];
      } else {
        // The discard is a string, to be transformed
        this.discardToString = content.discard;
        this.discard = JSON.parse(content.discard);
      }
    }
  }

  shuffle(): void {
    this.deck = this.deck.reduce(
      (cards, _, i) => {
        const random = Math.floor(Math.random() * (cards.length - i)) + i;
        [cards[i], cards[random]] = [cards[random], cards[i]];

        return cards;
      },
      [...this.deck]
    );
    this.deckToString = JSON.stringify(this.deck);
  }

  draw(n: number): ICard[] {
    const cardsToSend = this.deck.splice(0, n);
    this.deckToString = JSON.stringify(this.deck);

    this.discard = this.discard.concat(cardsToSend);
    this.discardToString = JSON.stringify(this.discard);

    return cardsToSend;
  }

  addCards(cards: ICard[]): void {
    this.deck = this.deck.concat(cards);
    this.deckToString = JSON.stringify(this.deck);
  }

  removeCards(cardsToDiscard: ICard[]): void {
    this.deck = this.deck.reduce<ICard[]>((cards, currentCard) => {
      // Arcana Condition
      if ((currentCard as Partial<IArcanaCard>)._id !== undefined) {
        const currentArcana = currentCard as IArcanaCard;
        if (
          cardsToDiscard.find(
            (cardToDiscard) => (cardToDiscard as Partial<IArcanaCard>)._id === currentArcana._id
          ) !== undefined
        ) {
          return cards;
        }
      }
      // Numbered Card Condition
      if ((currentCard as Partial<INumberCard>).suit !== undefined) {
        const currentNumbered = currentCard as INumberCard;
        if (
          cardsToDiscard.find(
            (cardToDiscard) =>
              (cardToDiscard as Partial<INumberCard>).suit === currentNumbered.suit &&
              (cardToDiscard as Partial<INumberCard>).number === currentNumbered.number
          ) !== undefined
        ) {
          return cards;
        }
      }
      cards.push(currentCard);

      return cards;
    }, []);
    this.deckToString = JSON.stringify(this.deck);
  }

  hideIfUser(isOwner: boolean): void {
    if (!isOwner) {
      this.deck = this.deck.map((card) => ({
        hidden: true,
      }));
      this.deckToString = JSON.stringify(this.deck);

      this.discard = this.discard.map((card) => ({
        hidden: true,
      }));
      this.discardToString = JSON.stringify(this.discard);
    }
  }
}

export { Deck };
