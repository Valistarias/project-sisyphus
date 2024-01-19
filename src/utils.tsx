import { type typeDice } from './interfaces';

export const fullTrim = (elt: string): string => elt.replace(/\s+/g, ' ').trim();

export const classTrim = (elt: string): string => fullTrim(elt.replace(/\n {2,}/g, ' '));

export const regexMail = /([A-z0-9._%-])+@([A-z0-9.-])+\.([A-z0-9]{2,})/g;

export const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export interface IFormattedDate {
  date: string;
  hour: string;
}

export const formatDate = (date: Date): IFormattedDate => ({
  date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
  hour: `${date.getHours()}:${date.getMinutes()}`,
});

export interface DiceRequest {
  /** The number of dices thrown */
  qty: number;
  /** The type of dice (as in the number of sides on the dice) */
  type: typeDice;
}

interface DiceResult {
  /** The type of dice (as in the number of sides on the dice) */
  type: typeDice;
  /** All the results, in an array */
  results: number[];
  /** All the results, summed up */
  total: number;
  /** The best throw on this type */
  best: number;
  /** The worst throw on this type */
  worst: number;
  /** The average value on the throws on this type */
  average: number;
}

export const throwDices = (dices: DiceRequest[]): DiceResult[] => {
  const resultsThrows: DiceResult[] = [];

  dices.forEach(({ qty, type }) => {
    let total = 0;
    let best = 0;
    let worst = 0;
    const results: number[] = [];

    for (let i = 0; i < qty; i++) {
      const throwValue = Math.floor(Math.random() * type) + 1;
      total += throwValue;
      results.push(throwValue);
      if (best < throwValue || i === 0) {
        best = throwValue;
      }
      if (worst > throwValue || i === 0) {
        worst = throwValue;
      }
    }

    resultsThrows.push({
      type,
      results,
      total,
      best,
      worst,
      average: Math.floor((total / qty) * 10) / 10,
    });
  });

  return resultsThrows;
};

export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);
