import { type TypeDice } from './types/data';

export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

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
  type: TypeDice;
}

export interface DiceResult {
  /** The type of dice (as in the number of sides on the dice) */
  type: TypeDice;
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

interface TotalResult {
  /** All the results, summed up */
  total: number;
  /** The best throw on this type */
  best?: number;
  /** The worst throw on this type */
  worst?: number;
}

export const createBacisDiceRequest = (): DiceRequest[] => [
  {
    type: 20,
    qty: 0,
  },
  {
    type: 12,
    qty: 0,
  },
  {
    type: 10,
    qty: 0,
  },
  {
    type: 8,
    qty: 0,
  },
  {
    type: 6,
    qty: 0,
  },
  {
    type: 4,
    qty: 0,
  },
];

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
      average: Math.floor((total / (qty || 1)) * 10) / 10,
    });
  });

  return resultsThrows;
};

export const diceResultToStr = (diceCats: DiceResult[] | null): string => {
  if (diceCats === null) {
    return '';
  }

  let stringified = '';
  const curatedCats = diceCats.filter((diceCat) => diceCat.results.length > 0);

  curatedCats.forEach((diceCat, catIndex) => {
    const catRolls = diceCat.results;
    if (catRolls.length > 0) {
      stringified += `${diceCat.type}:`;
      catRolls.forEach((roll, indexRoll) => {
        stringified += roll.toString();
        if (indexRoll < catRolls.length - 1) {
          stringified += ',';
        }
      });

      if (catIndex < curatedCats.length - 1) {
        stringified += ';';
      }
    }
  });
  return stringified;
};

export const strTodiceResult = (text: string): DiceResult[] => {
  const basicMold = createBacisDiceRequest();
  const catRollObj = {};
  text.split(';').forEach((catText) => {
    const [type, dicesText] = catText.split(':');
    catRollObj[Number(type)] = dicesText.split(',').map((diceText) => Number(diceText));
  });
  return basicMold.map(({ type }) => {
    const data = catRollObj[type];
    let total = 0;
    let best = 0;
    let worst = 0;
    if (data) {
      data.forEach((val: number, i: number) => {
        total += val;
        if (best < val || i === 0) {
          best = val;
        }
        if (worst > val || i === 0) {
          worst = val;
        }
      });
    }

    return {
      type,
      results: data || [],
      total,
      best,
      worst,
      average: Math.floor((total / (data?.length || 1)) * 10) / 10,
    };
  });
};

export const calculateDices = (diceGroups: DiceResult[]): TotalResult => {
  let total = 0;
  let optionnalParams: Pick<DiceResult, 'best' | 'worst'> | null = null;
  let canUseOptionnal = false;
  diceGroups.forEach(({ results, best, worst, total: totalDice }) => {
    if (results.length > 0) {
      total += totalDice;
      if (optionnalParams === null) {
        optionnalParams = {
          best,
          worst,
        };
        canUseOptionnal = true;
      } else if (canUseOptionnal) {
        canUseOptionnal = false;
      }
    }
  });
  return {
    total,
    ...(optionnalParams != null && canUseOptionnal ? optionnalParams : {}),
  };
};
