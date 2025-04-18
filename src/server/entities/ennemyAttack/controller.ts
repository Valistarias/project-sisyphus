import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIEnnemyAttack } from './model';
import type { InternationalizationType } from '../../utils/types';
import type { IDamageType } from '../index';

import { curateI18n } from '../../utils';

const { EnnemyAttack } = db;

const findEnnemyAttacks = async (): Promise<HydratedIEnnemyAttack[]> =>
  await new Promise((resolve, reject) => {
    EnnemyAttack.find()
      .populate<{ damageType: IDamageType }>('damageType')
      .then((res: HydratedIEnnemyAttack[]) => {
        if (res.length === 0) {
          reject(gemNotFound('EnnemyAttacks'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findEnnemyAttackById = async (id: string): Promise<HydratedIEnnemyAttack> =>
  await new Promise((resolve, reject) => {
    EnnemyAttack.findById(id)
      .populate<{ damageType: IDamageType }>('damageType')
      .then((res?: HydratedIEnnemyAttack | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('EnnemyAttack'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

export interface ISentEnnemyAttack {
  id?: string;
  title: string | null;
  summary: string | null;
  i18n: InternationalizationType | null;
  damageType: ObjectId | null;
  weaponScope: ObjectId | null;
  dices: string | null;
  bonusToHit: number | null;
}

const updateEnnemyAttacks = (
  elts: ISentEnnemyAttack[],
  ids: string[],
  cb: (err: unknown, res?: string[]) => void
): void => {
  if (elts.length === 0) {
    cb(null, ids);

    return;
  }
  const {
    id,
    title = null,
    summary = null,
    i18n = null,
    damageType = null,
    weaponScope = null,
    dices = null,
    bonusToHit = null,
  } = elts[0];
  if (id === undefined) {
    const ennemyAttack = new EnnemyAttack({
      title,
      summary,
      damageType,
      weaponScope,
      dices,
      bonusToHit,
    });

    if (i18n !== null) {
      ennemyAttack.i18n = JSON.stringify(i18n);
    }

    ennemyAttack
      .save()
      .then(() => {
        ids.push(String(ennemyAttack._id));
        elts.shift();
        updateEnnemyAttacks([...elts], ids, cb);
      })
      .catch(() => {
        cb(new Error('Error reading or creating ennemyAttack'));
      });
  } else {
    findEnnemyAttackById(id)
      .then((ennemyAttack) => {
        if (title !== null) {
          ennemyAttack.title = title;
        }
        if (summary !== null) {
          ennemyAttack.summary = summary;
        }
        if (damageType !== null) {
          ennemyAttack.damageType = damageType;
        }
        if (dices !== null) {
          ennemyAttack.dices = dices;
        }
        if (weaponScope !== null) {
          ennemyAttack.weaponScope = weaponScope;
        }
        if (bonusToHit !== null) {
          ennemyAttack.bonusToHit = bonusToHit;
        }

        if (i18n !== null) {
          const newIntl: InternationalizationType = {
            ...(ennemyAttack.i18n !== undefined && ennemyAttack.i18n !== ''
              ? JSON.parse(ennemyAttack.i18n)
              : {}),
          };

          Object.keys(i18n).forEach((lang) => {
            newIntl[lang] = i18n[lang];
          });

          ennemyAttack.i18n = JSON.stringify(newIntl);
        }

        ennemyAttack
          .save()
          .then(() => {
            ids.push(id);
            elts.shift();
            updateEnnemyAttacks([...elts], ids, cb);
          })
          .catch(() => {
            cb(new Error('Error reading or creating ennemyAttack'));
          });
      })
      .catch(() => {
        cb(new Error('Error reading or creating ennemyAttack'));
      });
  }
};

const smartUpdateAttacks = async ({
  attacksToRemove,
  attacksToUpdate,
}: {
  attacksToRemove: string[];
  attacksToUpdate: ISentEnnemyAttack[];
}): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    EnnemyAttack.deleteMany({ _id: { $in: attacksToRemove } })
      .then(() => {
        updateEnnemyAttacks(attacksToUpdate, [], (err: unknown, ids?: string[]) => {
          if (err !== null) {
            reject(err);
          } else {
            resolve(ids ?? []);
          }
        });
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, damageType, dices, weaponScope, bonusToHit } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    damageType === undefined ||
    weaponScope === undefined ||
    dices === undefined
  ) {
    res.status(400).send(gemInvalidField('EnnemyAttack'));

    return;
  }

  const ennemyAttack = new EnnemyAttack({
    title,
    summary,
    damageType,
    weaponScope,
    dices,
    bonusToHit,
  });

  if (i18n !== null) {
    ennemyAttack.i18n = JSON.stringify(i18n);
  }

  ennemyAttack
    .save()
    .then(() => {
      res.send(ennemyAttack);
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
    damageType = null,
    dices = null,
    weaponScope = null,
    bonusToHit = null,
  }: ISentEnnemyAttack = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('EnnemyAttack ID'));

    return;
  }
  findEnnemyAttackById(id)
    .then((ennemyAttack) => {
      if (title !== null) {
        ennemyAttack.title = title;
      }
      if (summary !== null) {
        ennemyAttack.summary = summary;
      }
      if (damageType !== null) {
        ennemyAttack.damageType = damageType;
      }
      if (dices !== null) {
        ennemyAttack.dices = dices;
      }
      if (weaponScope !== null) {
        ennemyAttack.weaponScope = weaponScope;
      }
      if (bonusToHit !== null) {
        ennemyAttack.bonusToHit = bonusToHit;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(ennemyAttack.i18n !== undefined && ennemyAttack.i18n !== ''
            ? JSON.parse(ennemyAttack.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        ennemyAttack.i18n = JSON.stringify(newIntl);
      }

      ennemyAttack
        .save()
        .then(() => {
          res.send({
            message: 'EnnemyAttack was updated successfully!',
            ennemyAttack,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('EnnemyAttack'));
    });
};

const deleteEnnemyAttackById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('EnnemyAttack ID'));

      return;
    }
    EnnemyAttack.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteEnnemyAttack = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteEnnemyAttackById(id)
    .then(() => {
      res.send({ message: 'EnnemyAttack was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIEnnemyAttack {
  i18n?: InternationalizationType;
  ennemyAttack: HydratedIEnnemyAttack;
}

const findSingle = (req: Request, res: Response): void => {
  const { ennemyAttackId } = req.query;
  if (ennemyAttackId === undefined || typeof ennemyAttackId !== 'string') {
    res.status(400).send(gemInvalidField('EnnemyAttack ID'));

    return;
  }
  findEnnemyAttackById(ennemyAttackId)
    .then((ennemyAttack) => {
      const sentObj = {
        ennemyAttack,
        i18n: curateI18n(ennemyAttack.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findEnnemyAttacks()
    .then((ennemyAttacks) => {
      const curatedEnnemyAttacks: CuratedIEnnemyAttack[] = [];

      ennemyAttacks.forEach((ennemyAttack) => {
        curatedEnnemyAttacks.push({
          ennemyAttack,
          i18n: curateI18n(ennemyAttack.i18n),
        });
      });

      res.send(curatedEnnemyAttacks);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteEnnemyAttack,
  findAll,
  findEnnemyAttackById,
  findSingle,
  smartUpdateAttacks,
  update,
};
