import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIRarity } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { Rarity } = db;

const findRarities = async (): Promise<HydratedIRarity[]> =>
  await new Promise((resolve, reject) => {
    Rarity.find()
      .sort({ position: 'asc' })
      .then((res: HydratedIRarity[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Rarities'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findRarityById = async (id: string): Promise<HydratedIRarity> =>
  await new Promise((resolve, reject) => {
    Rarity.findById(id)
      .then((res?: HydratedIRarity | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Rarity'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null } = req.body;
  if (title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier'));

    return;
  }

  findRarities()
    .then((rarities) => {
      const rarity = new Rarity({
        title,
        summary,
        position: rarities.length,
      });

      if (i18n !== null) {
        rarity.i18n = JSON.stringify(i18n);
      }

      rarity
        .save()
        .then(() => {
          res.send(rarity);
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier ID'));

    return;
  }
  findRarityById(id)
    .then((rarity) => {
      if (title !== null) {
        rarity.title = title;
      }
      if (summary !== null) {
        rarity.summary = summary;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(rarity.i18n !== undefined && rarity.i18n !== '' ? JSON.parse(rarity.i18n) : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        rarity.i18n = JSON.stringify(newIntl);
      }

      rarity
        .save()
        .then(() => {
          res.send({
            message: 'Item Modifier was updated successfully!',
            rarity,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Rarity'));
    });
};

const updateMultipleRaritiesPosition = (
  order: Array<{
    id: string;
    position: number;
  }>,
  cb: (res: Error | null) => void
): void => {
  Rarity.findOneAndUpdate({ _id: order[0].id }, { position: order[0].position })
    .then(() => {
      if (order.length > 1) {
        order.shift();
        updateMultipleRaritiesPosition([...order], cb);
      } else {
        cb(null);
      }
    })
    .catch(() => {
      cb(new Error('Rulebook not found'));
    });
};

const changeRaritiesOrder = (req: Request, res: Response): void => {
  const {
    order,
  }: {
    order?: Array<{
      id: string;
      position: number;
    }>;
  } = req.body;
  if (order === undefined) {
    res.status(400).send(gemInvalidField('Rarity Reordering'));

    return;
  }
  updateMultipleRaritiesPosition(order, (err) => {
    if (err !== null) {
      res.status(404).send(gemNotFound('Rarity'));
    } else {
      res.send({ message: 'Rarities were updated successfully!' });
    }
  });
};

const deleteRarityById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Item Modifier ID'));

      return;
    }
    Rarity.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteRarity = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteRarityById(id)
    .then(() => {
      res.send({ message: 'Item Modifier was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIRarity {
  i18n?: InternationalizationType;
  rarity: HydratedIRarity;
}

const findSingle = (req: Request, res: Response): void => {
  const { rarityId } = req.query;
  if (rarityId === undefined || typeof rarityId !== 'string') {
    res.status(400).send(gemInvalidField('Rarity ID'));

    return;
  }
  findRarityById(rarityId)
    .then((rarity) => {
      const sentObj = {
        rarity,
        i18n: curateI18n(rarity.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAllPromise = async (): Promise<CuratedIRarity[]> =>
  await new Promise((resolve, reject) => {
    findRarities()
      .then((rarities) => {
        const curatedRarities: CuratedIRarity[] = [];

        rarities.forEach((rarity) => {
          curatedRarities.push({
            rarity,
            i18n: curateI18n(rarity.i18n),
          });
        });

        resolve(curatedRarities);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const findAll = (req: Request, res: Response): void => {
  findAllPromise()
    .then((rarities) => {
      res.send(rarities);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  changeRaritiesOrder,
  create,
  deleteRarity,
  findAll,
  findAllPromise,
  findRarityById,
  findSingle,
  update,
};
