import type {
  Request, Response
} from 'express';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type { HydratedIBag } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { Bag } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findBags = async (options?: findAllPayload): Promise<HydratedIBag[]> =>
  await new Promise((resolve, reject) => {
    Bag.find(options ?? {})
      .then((res?: HydratedIBag[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Bags'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findBagById = async (id: string): Promise<HydratedIBag> =>
  await new Promise((resolve, reject) => {
    Bag.findById(id)
      .then((res?: HydratedIBag | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Bag'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    i18n = null,
    storableItemTypes,
    rarity,
    starterKit,
    itemType,
    itemModifiers,
    cost,
    size
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || storableItemTypes === undefined
    || rarity === undefined
    || size === undefined
    || itemType === undefined
    || cost === undefined
  ) {
    res.status(400).send(gemInvalidField('Bag'));

    return;
  }

  const bag = new Bag({
    title,
    summary,
    rarity,
    starterKit,
    cost,
    size,
    itemType,
    storableItemTypes,
    itemModifiers
  });

  if (i18n !== null) {
    bag.i18n = JSON.stringify(i18n);
  }

  bag
    .save()
    .then(() => {
      res.send(bag);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    i18n,
    storableItemTypes = null,
    rarity = null,
    starterKit = null,
    itemModifiers = null,
    cost = null,
    itemType = null,
    size = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Bag ID'));

    return;
  }

  findBagById(id as string)
    .then((bag) => {
      if (title !== null) {
        bag.title = title;
      }
      if (storableItemTypes !== null) {
        bag.storableItemTypes = storableItemTypes;
      }
      if (summary !== null) {
        bag.summary = summary;
      }
      if (size !== null) {
        bag.size = size;
      }
      if (rarity !== null) {
        bag.rarity = rarity;
      }
      if (starterKit !== null) {
        bag.starterKit = starterKit;
      }
      if (itemType !== null) {
        bag.itemType = itemType;
      }
      if (itemModifiers !== null) {
        bag.itemModifiers = itemModifiers;
      }
      if (cost !== null) {
        bag.cost = cost;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(bag.i18n !== null && bag.i18n !== undefined && bag.i18n !== ''
          ? JSON.parse(bag.i18n)
          : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        bag.i18n = JSON.stringify(newIntl);
      }

      bag
        .save()
        .then(() => {
          res.send({
            message: 'Bag was updated successfully!', bag
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Bag'));
    });
};

const deleteBagById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Bag ID'));

      return;
    }
    Bag.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteBag = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findBagById(id)
    .then(() => {
      deleteBagById(id)
        .then(() => {
          res.send({ message: 'Bag was deleted successfully!' });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Bag'));
    });
};

interface CuratedIBag {
  i18n?: InternationalizationType
  bag: any
}

const findSingle = (req: Request, res: Response): void => {
  const { bagId } = req.query;
  if (bagId === undefined || typeof bagId !== 'string') {
    res.status(400).send(gemInvalidField('Bag ID'));

    return;
  }
  findBagById(bagId)
    .then((bagSent) => {
      const bag = bagSent.toJSON();
      const sentObj = {
        bag,
        i18n: curateI18n(bagSent.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findBags()
    .then((bags) => {
      const curatedBags: CuratedIBag[] = [];
      bags.forEach((bagSent) => {
        const bag = bagSent.toJSON();
        curatedBags.push({
          bag,
          i18n: curateI18n(bagSent.i18n)
        });
      });

      res.send(curatedBags);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findBags({ starterKit: { $in: ['always', 'option'] } })
    .then((bags) => {
      const curatedBags: CuratedIBag[] = [];
      bags.forEach((bagSent) => {
        const bag = bagSent.toJSON();
        curatedBags.push({
          bag,
          i18n: curateI18n(bagSent.i18n)
        });
      });

      res.send(curatedBags);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteBag, findAll, findAllStarter, findBagById, findSingle, update
};
