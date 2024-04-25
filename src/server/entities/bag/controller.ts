import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedIBag } from './model';

const { Bag } = db;

const findBags = async (): Promise<HydratedIBag[]> =>
  await new Promise((resolve, reject) => {
    Bag.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Bags'));
        } else {
          resolve(res as HydratedIBag[]);
        }
      })
      .catch(async (err: Error) => {
        reject(err);
      });
  });

const findBagById = async (id: string): Promise<HydratedIBag> =>
  await new Promise((resolve, reject) => {
    Bag.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Bag'));
        } else {
          resolve(res as HydratedIBag);
        }
      })
      .catch(async (err: Error) => {
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
    itemType,
    itemModifiers,
    cost,
    size,
  } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    storableItemTypes === undefined ||
    rarity === undefined ||
    size === undefined ||
    itemType === undefined ||
    cost === undefined
  ) {
    res.status(400).send(gemInvalidField('Bag'));
    return;
  }

  const bag = new Bag({
    title,
    summary,
    rarity,
    cost,
    size,
    itemType,
    storableItemTypes,
    itemModifiers,
  });

  if (i18n !== null) {
    bag.i18n = JSON.stringify(i18n);
  }

  bag
    .save()
    .then(() => {
      res.send(bag);
    })
    .catch((err: Error) => {
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
    itemModifiers = null,
    cost = null,
    itemType = null,
    size = null,
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
        const newIntl = {
          ...(bag.i18n !== null && bag.i18n !== undefined && bag.i18n !== ''
            ? JSON.parse(bag.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        bag.i18n = JSON.stringify(newIntl);
      }

      bag
        .save()
        .then(() => {
          res.send({ message: 'Bag was updated successfully!', bag });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Bag'));
    });
};

const deleteBagById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Bag ID'));
      return;
    }
    Bag.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteBag = (req: Request, res: Response): void => {
  const { id } = req.body;

  findBagById(id as string)
    .then(() => {
      deleteBagById(id as string)
        .then(() => {
          res.send({ message: 'Bag was deleted successfully!' });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Bag'));
    });
};

interface CuratedIBag {
  i18n: Record<string, any> | Record<string, unknown>;
  bag: any;
}

const curateBag = (bag: HydratedIBag): Record<string, any> => {
  if (bag.i18n === null || bag.i18n === '' || bag.i18n === undefined) {
    return {};
  }
  return JSON.parse(bag.i18n);
};

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
        i18n: curateBag(bagSent),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
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
          i18n: curateBag(bagSent),
        });
      });

      res.send(curatedBags);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteBag, findAll, findBagById, findSingle, update };