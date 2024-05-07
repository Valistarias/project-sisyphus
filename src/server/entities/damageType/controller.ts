import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedIDamageType } from './model';

import { curateI18n } from '../../utils';

const { DamageType } = db;

const findDamageTypes = async (): Promise<HydratedIDamageType[]> =>
  await new Promise((resolve, reject) => {
    DamageType.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('DamageTypes'));
        } else {
          resolve(res as HydratedIDamageType[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findDamageTypeById = async (id: string): Promise<HydratedIDamageType> =>
  await new Promise((resolve, reject) => {
    DamageType.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('DamageType'));
        } else {
          resolve(res as HydratedIDamageType);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null } = req.body;
  if (title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('Damage Type'));
    return;
  }

  const damageType = new DamageType({
    title,
    summary,
  });

  if (i18n !== null) {
    damageType.i18n = JSON.stringify(i18n);
  }

  damageType
    .save()
    .then(() => {
      res.send(damageType);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Damage Type ID'));
    return;
  }
  findDamageTypeById(id as string)
    .then((damageType) => {
      if (title !== null) {
        damageType.title = title;
      }
      if (summary !== null) {
        damageType.summary = summary;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(damageType.i18n !== null && damageType.i18n !== undefined && damageType.i18n !== ''
            ? JSON.parse(damageType.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        damageType.i18n = JSON.stringify(newIntl);
      }

      damageType
        .save()
        .then(() => {
          res.send({ message: 'Damage Type was updated successfully!', damageType });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Damage Type'));
    });
};

const deleteDamageTypeById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Damage Type ID'));
      return;
    }
    DamageType.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteDamageType = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteDamageTypeById(id as string)
    .then(() => {
      res.send({ message: 'Damage Type was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIDamageType {
  i18n: Record<string, any> | Record<string, unknown>;
  damageType: HydratedIDamageType;
}

const findSingle = (req: Request, res: Response): void => {
  const { damageTypeId } = req.query;
  if (damageTypeId === undefined || typeof damageTypeId !== 'string') {
    res.status(400).send(gemInvalidField('DamageType ID'));
    return;
  }
  findDamageTypeById(damageTypeId)
    .then((damageType) => {
      const sentObj = {
        damageType,
        i18n: curateI18n(damageType.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findDamageTypes()
    .then((damageTypes) => {
      const curatedDamageTypes: CuratedIDamageType[] = [];

      damageTypes.forEach((damageType) => {
        curatedDamageTypes.push({
          damageType,
          i18n: curateI18n(damageType.i18n),
        });
      });

      res.send(curatedDamageTypes);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteDamageType, findAll, findDamageTypeById, findSingle, update };
