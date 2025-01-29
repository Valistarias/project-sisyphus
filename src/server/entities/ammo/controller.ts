import type {
  Request, Response
} from 'express';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type {
  HydratedIAmmo, IAmmo
} from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { Ammo } = db;

const findAmmos = async (): Promise<HydratedIAmmo[]> =>
  await new Promise((resolve, reject) => {
    Ammo.find()
      .then((res: HydratedIAmmo[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Ammos'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findAmmoById = async (id: string): Promise<HydratedIAmmo> =>
  await new Promise((resolve, reject) => {
    Ammo.findById(id)
      .then((res?: HydratedIAmmo | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Ammo'));
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
    offsetToHit,
    offsetDamage,
    rarity,
    itemType,
    weaponTypes,
    itemModifiers,
    cost
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || rarity === undefined
    || itemType === undefined
    || weaponTypes === undefined
    || cost === undefined
  ) {
    res.status(400).send(gemInvalidField('Ammo'));

    return;
  }

  const ammo: HydratedIAmmo = new Ammo({
    title,
    summary,
    rarity,
    cost,
    itemType,
    weaponTypes,
    offsetToHit,
    offsetDamage,
    itemModifiers
  });

  if (i18n !== null) {
    ammo.i18n = JSON.stringify(i18n);
  }

  ammo
    .save()
    .then(() => {
      res.send(ammo);
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
    offsetToHit = null,
    offsetDamage = null,
    rarity = null,
    itemType = null,
    weaponTypes = null,
    itemModifiers = null,
    cost = null
  }: {
    id?: string
    title: string | null
    summary: string | null
    i18n: InternationalizationType | null
    offsetToHit: number | null
    offsetDamage: number | null
    rarity: string | null
    itemType: string | null
    weaponTypes: string[] | null
    itemModifiers: string[] | null
    cost: number | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Ammo ID'));

    return;
  }

  findAmmoById(id)
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
        const newIntl: InternationalizationType = { ...(ammo.i18n !== undefined && ammo.i18n !== '' ? JSON.parse(ammo.i18n) : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        ammo.i18n = JSON.stringify(newIntl);
      }

      ammo
        .save()
        .then(() => {
          res.send({
            message: 'Ammo was updated successfully!', ammo
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Ammo'));
    });
};

const deleteAmmoById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Ammo ID'));

      return;
    }
    Ammo.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteAmmo = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findAmmoById(id)
    .then(() => {
      deleteAmmoById(id)
        .then(() => {
          res.send({ message: 'Ammo was deleted successfully!' });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Ammo'));
    });
};

export interface CuratedIAmmo {
  i18n?: InternationalizationType
  ammo: IAmmo<string>
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
        i18n: curateI18n(ammoSent.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
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
          i18n: curateI18n(ammoSent.i18n)
        });
      });

      res.send(curatedAmmos);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteAmmo, findAll, findAmmoById, findSingle, update
};
