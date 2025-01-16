import type {
  Request, Response
} from 'express';
import type { HydratedDocument } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type {
  IDamageType, IWeapon
} from '../index';
import type {
  HydratedIDamage, IDamage
} from './model';

const {
  Damage, Weapon
} = db;

const findDamages = async (): Promise<HydratedIDamage[]> =>
  await new Promise((resolve, reject) => {
    Damage.find()
      .populate<{ damageType: IDamageType }>('damageType')
      .then((res: HydratedIDamage[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Damages'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findDamageById = async (id: string): Promise<HydratedIDamage> =>
  await new Promise((resolve, reject) => {
    Damage.findById(id)
      .populate<{ damageType: IDamageType }>('damageType')
      .then((res?: HydratedIDamage | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Damage'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const createReadDamage = (
  elts: Array<{
    damageType: string
    dices: string
  }>,
  ids: string[],
  cb: (err: unknown, res?: string[]) => void
): void => {
  if (elts.length === 0) {
    cb(null, ids);

    return;
  }
  const actualElt = elts[0];
  Damage.findOne(actualElt)
    .then((sentDamage?: HydratedDocument<IDamage> | null) => {
      if (sentDamage === undefined || sentDamage === null) {
        // Need to create it
        const damage = new Damage(actualElt);

        damage
          .save()
          .then(() => {
            ids.push(String(damage._id));
            elts.shift();
            createReadDamage([...elts], ids, cb);
          })
          .catch(() => {
            cb(new Error('Error reading or creating damage'));
          });
      } else {
        // Exists already
        ids.push(String(sentDamage._id));
        if (elts.length > 1) {
          elts.shift();
          createReadDamage([...elts], ids, cb);
        } else {
          cb(null, ids);
        }
      }
    })
    .catch(() => {
      cb(new Error('Error reading or creating damage'));
    });
};

const smartDeleteDamage = (
  elts: string[],
  cb: (err: unknown) => void): void => {
  if (elts.length === 0) {
    cb(null);

    return;
  }
  const actualElt = elts[0];
  let counter = 0;
  Weapon.find({ damages: actualElt })
    .then((sentWeapons: IWeapon[]) => {
      counter += sentWeapons.length;
      if (counter <= 1) {
        Damage.findByIdAndDelete(actualElt)
          .then(() => {
            elts.shift();
            smartDeleteDamage([...elts], cb);
          })
          .catch(() => {
            cb(new Error('Error deleting damage'));
          });
      } else {
        elts.shift();
        smartDeleteDamage([...elts], cb);
      }
    })
    .catch(() => {
      cb(new Error('Error deleting damage'));
    });
};

const curateDamageIds = async ({
  damagesToRemove,
  damagesToAdd,
  damagesToStay
}: {
  damagesToRemove: string[]
  damagesToAdd?: Array<{
    damageType: string
    dices: string
  }>
  damagesToStay: string[]
}): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    smartDeleteDamage(damagesToRemove, (err: unknown) => {
      if (err !== null) {
        reject(err);
      } else {
        if (damagesToAdd !== undefined) {
          createReadDamage(damagesToAdd, [], (err: unknown, res?: string[]) => {
            if (err !== null) {
              reject(err);
            } else {
              resolve([...damagesToStay, ...(res ?? [])]);
            }
          });
        } else {
          resolve(damagesToStay);
        }
      }
    });
  });

const create = (req: Request, res: Response): void => {
  const {
    damageType, dices
  } = req.body;
  if (damageType === undefined || dices === undefined) {
    res.status(400).send(gemInvalidField('Damage'));

    return;
  }

  const damage = new Damage({
    damageType,
    dices
  });

  damage
    .save()
    .then(() => {
      res.send(damage);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id, damageType = null, dices = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Damage ID'));

    return;
  }
  findDamageById(id as string)
    .then((damage) => {
      if (damageType !== null) {
        damage.damageType = damageType;
      }
      if (dices !== null) {
        damage.dices = dices;
      }

      damage
        .save()
        .then(() => {
          res.send({
            message: 'Damage was updated successfully!', damage
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Damage'));
    });
};

const deleteDamageById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Damage ID'));

      return;
    }
    Damage.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteDamage = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteDamageById(id)
    .then(() => {
      res.send({ message: 'Damage was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { damageId } = req.query;
  if (damageId === undefined || typeof damageId !== 'string') {
    res.status(400).send(gemInvalidField('Damage ID'));

    return;
  }
  findDamageById(damageId)
    .then((damage) => {
      res.send(damage);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findDamages()
    .then((damages) => {
      res.send(damages);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  curateDamageIds,
  deleteDamage,
  findAll,
  findDamageById,
  findSingle,
  update
};
