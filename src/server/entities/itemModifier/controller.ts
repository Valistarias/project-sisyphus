import type { Request, Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { HydratedIItemModifier } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { ItemModifier } = db;

const findItemModifiers = async (): Promise<HydratedIItemModifier[]> =>
  await new Promise((resolve, reject) => {
    ItemModifier.find()
      .then((res: HydratedIItemModifier[]) => {
        if (res.length === 0) {
          reject(gemNotFound('ItemModifiers'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findItemModifierById = async (id: string): Promise<HydratedIItemModifier> =>
  await new Promise((resolve, reject) => {
    ItemModifier.findById(id)
      .then((res?: HydratedIItemModifier | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ItemModifier'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const checkDuplicateItemModifierModifierId = async (
  modifierId: string,
  alreadyExistOnce = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    ItemModifier.find({ modifierId })
      .then((res) => {
        if (res.length === 0 || (alreadyExistOnce && res.length === 1)) {
          resolve(false);
        } else {
          resolve(res[0].title);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const checkDuplicateModifierId = async (
  modifierId: string | null,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    if (modifierId === null) {
      resolve(false);
    } else {
      checkDuplicateItemModifierModifierId(modifierId, alreadyExistOnce)
        .then((responseItemModifier: string | boolean) => {
          if (typeof responseItemModifier === 'boolean') {
            resolve(false);
          } else {
            resolve(responseItemModifier);
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    }
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, modifierId } = req.body;
  if (title === undefined || summary === undefined || modifierId === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier'));

    return;
  }

  checkDuplicateModifierId(modifierId as string, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const itemModifier = new ItemModifier({
          title,
          summary,
          modifierId,
        });

        if (i18n !== null) {
          itemModifier.i18n = JSON.stringify(i18n);
        }

        itemModifier
          .save()
          .then(() => {
            res.send(itemModifier);
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate(response));
      }
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
    modifierId = null,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
    modifierId: string | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier ID'));

    return;
  }
  findItemModifierById(id)
    .then((itemModifier) => {
      const alreadyExistOnce =
        typeof modifierId === 'string' && modifierId === itemModifier.modifierId;
      checkDuplicateModifierId(modifierId, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              itemModifier.title = title;
            }
            if (modifierId !== null) {
              itemModifier.modifierId = modifierId;
            }
            if (summary !== null) {
              itemModifier.summary = summary;
            }

            if (i18n !== null) {
              const newIntl: InternationalizationType = {
                ...(itemModifier.i18n !== undefined && itemModifier.i18n !== ''
                  ? JSON.parse(itemModifier.i18n)
                  : {}),
              };

              Object.keys(i18n).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              itemModifier.i18n = JSON.stringify(newIntl);
            }

            itemModifier
              .save()
              .then(() => {
                res.send({
                  message: 'Item Modifier was updated successfully!',
                  itemModifier,
                });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('ModifierId'));
          }
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Item Modifier'));
    });
};

const deleteItemModifierById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Item Modifier ID'));

      return;
    }
    ItemModifier.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteItemModifier = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteItemModifierById(id)
    .then(() => {
      res.send({ message: 'Item Modifier was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIItemModifier {
  i18n?: InternationalizationType;
  itemModifier: HydratedIItemModifier;
}

const findSingle = (req: Request, res: Response): void => {
  const { itemModifierId } = req.query;
  if (itemModifierId === undefined || typeof itemModifierId !== 'string') {
    res.status(400).send(gemInvalidField('ItemModifier ID'));

    return;
  }
  findItemModifierById(itemModifierId)
    .then((itemModifier) => {
      const sentObj = {
        itemModifier,
        i18n: curateI18n(itemModifier.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findItemModifiers()
    .then((itemModifiers) => {
      const curatedItemModifiers: CuratedIItemModifier[] = [];

      itemModifiers.forEach((itemModifier) => {
        curatedItemModifiers.push({
          itemModifier,
          i18n: curateI18n(itemModifier.i18n),
        });
      });

      res.send(curatedItemModifiers);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateItemModifierModifierId,
  create,
  deleteItemModifier,
  findAll,
  findItemModifierById,
  findSingle,
  update,
};
