import { diacriticsMap } from './diacriticsMap';

import type { ICharacter, IGlobalValue, INumberCard, IRole, TypeDice } from '../types';

export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

export const fullTrim = (elt: string): string => elt.replace(/\s+/g, ' ').trim();

export const classTrim = (elt: string): string => fullTrim(elt.replace(/\n {2,}/g, ' '));

export const removeDiacritics = (str: string): string =>
  // eslint-disable-next-line no-control-regex -- Elements neccessary in regex
  str.replace(/[^\u0000-\u007E]/g, function (a) {
    return diacriticsMap[a] ?? a;
  });

export const arrSum = (elt: number[]): number =>
  elt.reduce(function (prev, cur) {
    return prev + cur;
  });

export const decimal = (val: number, decimal: number): number =>
  Math.round(val * decimal) / decimal;

export const capitalizeFirstLetter = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const regexMail = /([A-z0-9._%-])+@([A-z0-9.-])+\.([A-z0-9]{2,})/g;

export const regexDiceFormula = /^(\d+)d(\d+)$/g;

export const addSymbol = (val: number): string => {
  if (val > 0) {
    return `+${val}`;
  }

  return String(val);
};

export const arraysEqual = (a: string[] | null, b: string[] | null): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};

export const romanize = (num: number): string | boolean => {
  if (num <= 0) {
    return '0';
  }
  const lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = '';
  Object.keys(lookup).forEach((lookupKey) => {
    const actualLookup = lookup[lookupKey];
    while (num >= actualLookup) {
      roman += lookupKey;
      num -= actualLookup;
    }
  });

  return roman;
};

export const isThereDuplicate = (elts: string[]): boolean => {
  const count = {};
  let duplicate = false;
  elts.forEach((elt) => {
    if (count[elt] === undefined) {
      count[elt] = 0;
    }
    count[elt] = count[elt] + 1;
    if (count[elt] > 1 || duplicate) {
      duplicate = true;
    }
  });

  return duplicate;
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
  /** The offset to be added to the roll */
  offset: number;
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
  /** The offset value on the result */
  offset: number;
  /** The associated card to offset the result */
  card: INumberCard | null;
}

export interface UniqueResultDiceData {
  /** The ID of the dice element */
  id: string;
  /** The type of dice */
  type: TypeDice;
  /** The value of the dice */
  value: number;
}

interface TotalResult {
  /** All the results, summed up */
  total: number;
  /** The best throw on this type */
  best?: number;
  /** The worst throw on this type */
  worst?: number;
}

export const createBasicDiceRequest = (): DiceRequest[] => [
  {
    type: 20,
    qty: 0,
    offset: 0,
  },
  {
    type: 12,
    qty: 0,
    offset: 0,
  },
  {
    type: 10,
    qty: 0,
    offset: 0,
  },
  {
    type: 8,
    qty: 0,
    offset: 0,
  },
  {
    type: 6,
    qty: 0,
    offset: 0,
  },
  {
    type: 4,
    qty: 0,
    offset: 0,
  },
];

export const throwDices = (dices: DiceRequest[]): DiceResult[] => {
  const resultsThrows: DiceResult[] = [];

  dices.forEach(({ qty, type, offset }) => {
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
    total += offset;
    best += offset;
    worst += offset;

    resultsThrows.push({
      type,
      results,
      total,
      best,
      worst,
      offset,
      average: Math.floor((total / qty) * 10) / 10,
      card: null,
    });
  });

  return resultsThrows;
};

export const diceResultToStr = (
  diceCats: DiceResult[] | null,
  offsetCard?: INumberCard
): string => {
  if (diceCats === null) {
    return '';
  }

  let stringified = '';
  const curatedCats = diceCats.filter((diceCat) => diceCat.results.length > 0);

  curatedCats.forEach((diceCat, catIndex) => {
    const catRolls = diceCat.results;
    let relevantCard: INumberCard | null;
    if (catIndex === 0 && offsetCard !== undefined) {
      relevantCard = offsetCard;
    } else {
      relevantCard = diceCat.card;
    }
    if (catRolls.length > 0) {
      stringified += `${diceCat.type}:`;
      catRolls.forEach((roll, indexRoll) => {
        stringified += roll.toString();
        if (indexRoll < catRolls.length - 1) {
          stringified += ',';
        }
      });
      stringified += `+${diceCat.offset}${relevantCard !== null ? `*${relevantCard.suit}-${relevantCard.number}` : ''}`;
      if (catIndex < curatedCats.length - 1) {
        stringified += ';';
      }
    }
  });

  return stringified;
};

export const strToDiceRequest = (text: string): DiceRequest => {
  const [dice, offset] = text.split('+');
  const [qty, type] = dice.split('d');

  return {
    qty: Number(qty),
    type: Number(type) as TypeDice,
    offset: (offset as string | undefined) !== undefined ? Number(offset) : 0,
  };
};

export const strToDiceResult = (text: string): DiceResult[] => {
  const basicMold = createBasicDiceRequest();
  const catRollObj: Partial<
    Record<
      string,
      {
        dices: number[];
        offset?: string;
        card?: string;
      }
    >
  > = {};
  text.split(';').forEach((catText) => {
    const [type, dicesText] = catText.split(':');
    const [dices, offset] = dicesText.split('+');
    catRollObj[Number(type)] = {
      dices: dices.split(',').map((diceText) => Number(diceText)),
      offset: offset.split('*')[0],
      card: offset.split('*')[1],
    };
  });

  return basicMold.map(({ type }) => {
    const data = catRollObj[type];
    let total = 0;
    let best = 0;
    let worst = 0;
    if (data !== undefined) {
      data.dices.forEach((val: number, i: number) => {
        total += val;
        if (best < val || i === 0) {
          best = val;
        }
        if (worst > val || i === 0) {
          worst = val;
        }
      });
    }

    let cleanCard: INumberCard | undefined;
    if (data?.card !== undefined) {
      cleanCard = {
        suit: data.card.split('-')[0],
        number: Number(data.card.split('-')[1]),
      };
    }

    return {
      type,
      results: data?.dices ?? [],
      total,
      best,
      worst,
      offset: data?.offset !== undefined ? Number(data.offset) : 0,
      average: Math.floor((total / (data !== undefined ? data.dices.length : 1)) * 10) / 10,
      card: cleanCard ?? null,
    };
  });
};

export const calculateDices = (diceGroups: DiceResult[]): TotalResult => {
  let total = 0;
  const optionnalParams: Pick<DiceResult, 'best' | 'worst'> = {
    best: diceGroups[0].best,
    worst: diceGroups[0].worst,
  };
  diceGroups.forEach(({ results, best, worst, total: totalDice }) => {
    if (results.length > 0) {
      total += totalDice;
      if (optionnalParams.best < best) {
        optionnalParams.best = best;
      }
      if (optionnalParams.worst > worst) {
        optionnalParams.worst = worst;
      }
    }
  });

  return {
    total,
    ...optionnalParams,
  };
};

const applyFormula = (text: string, formula: string, char: ICharacter | null | false): string =>
  'TAKE FORMULA IN CONSIDERATION';

export const curateStringFormula = (
  text: string,
  formula: string,
  char?: ICharacter | null | false
): string => {
  const splitted = text.split('{{formula}}');
  if (splitted.length === 1 || char === undefined) {
    return text;
  }
  if (char === false || char === null) {
    return [splitted[0], 'X', [splitted[1]]].join(' ');
  }

  return applyFormula(text, formula, char);
};

export const curateStringDamage = (
  text: string,
  damages: string,
  formula: string,
  char: ICharacter | null | false
): string => {
  const splitted = text.split('{{damage}}');
  if (splitted.length === 1) {
    return text;
  }
  if (char === false || char === null) {
    return [splitted[0], 'X', [splitted[1]]].join(' ');
  }

  return applyFormula(text, `${damages}+${formula}`, char);
};

export const countTrueInArray = (arr: boolean[] | undefined): number => {
  if (arr === undefined) {
    return 0;
  }

  return arr.reduce((total: number, value: boolean) => {
    if (value) {
      return total + 1;
    }

    return total;
  }, 0);
};

export const getValuesFromGlobalValues = (
  namesSent: string[],
  globalValues: IGlobalValue[]
): Record<string, number | undefined> => {
  const elt: Record<string, number> = {};
  namesSent.forEach((nameSent) => {
    elt[nameSent] = Number(globalValues.find(({ name }) => name === nameSent)?.value ?? 0);
  });

  return elt;
};

type verticalPositionning = 'top' | 'bottom';
type horizontalPositionning = 'left' | 'right';

type priorityPositionning =
  | verticalPositionning
  | horizontalPositionning
  | `${verticalPositionning}-${horizontalPositionning}`;

export const setHintPlacement = (
  domPos: DOMRect,
  hintPos: DOMRect,
  priority: priorityPositionning
): string => {
  const [firstPriority, secondPriority]: Array<string | undefined> = priority.split('-');

  // This needs to be changed with var(--hint-space), to be the same value
  const offsetHint = 10;

  let firstChoice = firstPriority;
  let secondChoice: string | undefined;

  if (firstPriority === 'top' || firstPriority === 'bottom') {
    if (firstPriority === 'top') {
      if (domPos.top < offsetHint + hintPos.height) {
        firstChoice = 'bottom';
      }
    } else {
      if (document.body.offsetHeight - domPos.bottom < offsetHint + hintPos.height) {
        firstChoice = 'top';
      }
    }
  } else if (firstPriority === 'left' || firstPriority === 'right') {
    if (firstPriority === 'left') {
      if (domPos.left < offsetHint + hintPos.width) {
        firstChoice = 'right';
      }
    } else {
      if (document.body.offsetWidth - domPos.right < offsetHint + hintPos.width) {
        firstChoice = 'left';
      }
    }
  }

  if ((secondPriority as string | undefined) !== undefined) {
    secondChoice = secondPriority;

    const leftSpaceLeft = domPos.left;
    const rightSpaceLeft = document.body.offsetWidth - domPos.right;
    const offsetButtonHint = hintPos.width - domPos.width;

    if (offsetButtonHint > 0) {
      if (secondPriority === 'left') {
        if (rightSpaceLeft < offsetButtonHint) {
          secondChoice = 'right';
        }
      } else {
        if (leftSpaceLeft < offsetButtonHint) {
          secondChoice = 'left';
        }
      }
    }
  }

  return `${firstChoice}${secondChoice !== undefined ? `-${secondChoice}` : ''}`;
};

export const checkIfAdminFromRolesFront = (roles: IRole[]): boolean =>
  roles.find((role) => role.name === 'admin' || role.name === 'super') !== undefined;

export { getCyberFrameLevelsByNodes, type ICyberFrameLevels } from './character';
