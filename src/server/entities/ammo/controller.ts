import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIAmmo } from './model';

import { curateI18n } from '../../utils';

const { Ammo } = db;

const findAmmos = async (): Promise<HydratedIAmmo[]> =>
  await new Promise((resolve, reject) => {
    Ammo.find()
      .then(async (res?: HydratedIAmmo[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Ammos'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: Error) => {
        reject(err);
      });
  });

const findAmmoById = async (id: string): Promise<HydratedIAmmo> =>
  await new Promise((resolve, reject) => {
    Ammo.findById(id)
      .then(async (res?: HydratedIAmmo | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Ammo'));
        } else {
          resolve(res);
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
    offsetToHit,
    offsetDamage,
    rarity,
    itemType,
    weaponTypes,
    itemModifiers,
    cost,
  } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    rarity === undefined ||
    itemType === undefined ||
    weaponTypes === undefined ||
    cost === undefined
  ) {
    res.status(400).send(gemInvalidField('Ammo'));
    return;
  }

  const ammo = new Ammo({
    title,
    summary,
    rarity,
    cost,
    itemType,
    weaponTypes,
    offsetToHit,
    offsetDamage,
    itemModifiers,
  });

  if (i18n !== null) {
    ammo.i18n = JSON.stringify(i18n);
  }

  ammo
    .save()
    .then(() => {
      res.send(ammo);
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
    offsetToHit = null,
    offsetDamage = null,
    rarity = null,
    itemType = null,
    weaponTypes = null,
    itemModifiers = null,
    cost = null,
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Ammo ID'));
    return;
  }

  findAmmoById(id as string)
    .then((ammo) => {
      if (title !== null) {
        ammo.title = title;
      }
      if (offsetToHit !== null) {
        ammo.offsetToHit = offsetToHit;
      }
      if (weaponTypes !== null) {
        ammo.weaponTypes = weaponTypes;
      }
      if (summary !== null) {
        ammo.summary = summary;
      }
      if (offsetDamage !== null) {
        ammo.offsetDamage = offsetDamage;
      }
      if (rarity !== null) {
        ammo.rarity = rarity;
      }
      if (itemType !== null) {
        ammo.itemType = itemType;
      }
      if (itemModifiers !== null) {
        ammo.itemModifiers = itemModifiers;
      }
      if (cost !== null) {
        ammo.cost = cost;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(ammo.i18n !== null && ammo.i18n !== undefined && ammo.i18n !== ''
            ? JSON.parse(ammo.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        ammo.i18n = JSON.stringify(newIntl);
      }

      ammo
        .save()
        .then(() => {
          res.send({ message: 'Ammo was updated successfully!', ammo });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Ammo'));
    });
};

const deleteAmmoById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Ammo ID'));
      return;
    }
    Ammo.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteAmmo = (req: Request, res: Response): void => {
  const { id } = req.body;

  findAmmoById(id as string)
    .then(() => {
      deleteAmmoById(id as string)
        .then(() => {
          res.send({ message: 'Ammo was deleted successfully!' });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Ammo'));
    });
};

interface CuratedIAmmo {
  i18n: Record<string, any> | Record<string, unknown>;
  ammo: any;
}

const findSingle = (req: Request, res: Response): void => {
  const { ammoId } = req.query;
  if (ammoId === undefined || typeof ammoId !== 'string') {
    res.status(400).send(gemInvalidField('Ammo ID'));
    return;
  }
  findAmmoById(ammoId)
    .then((ammoSent) => {
      const ammo = ammoSent.toJSON();
      const sentObj = {
        ammo,
        i18n: curateI18n(ammoSent.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findAmmos()
    .then((ammos) => {
      const curatedAmmos: CuratedIAmmo[] = [];
      ammos.forEach((ammoSent) => {
        const ammo = ammoSent.toJSON();
        curatedAmmos.push({
          ammo,
          i18n: curateI18n(ammoSent.i18n),
        });
      });

      res.send(curatedAmmos);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteAmmo, findAll, findAmmoById, findSingle, update };
