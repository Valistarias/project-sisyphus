import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIWeaponType } from './model';
import type { InternationalizationType } from '../../utils/types';
import type { IItemType } from '../itemType/model';
import type { IWeaponStyle } from '../weaponStyle/model';

import { curateI18n } from '../../utils';

const { WeaponType } = db;

const findWeaponTypes = async (): Promise<HydratedIWeaponType[]> =>
  await new Promise((resolve, reject) => {
    WeaponType.find()
      .populate<{ weaponStyle: IWeaponStyle }>('weaponStyle')
      .populate<{ itemType: IItemType }>('itemType')
      .then((res: HydratedIWeaponType[]) => {
        if (res.length === 0) {
          reject(gemNotFound('WeaponTypes'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findWeaponTypeById = async (id: string): Promise<HydratedIWeaponType> =>
  await new Promise((resolve, reject) => {
    WeaponType.findById(id)
      .populate<{ weaponStyle: IWeaponStyle }>('weaponStyle')
      .populate<{ itemType: IItemType }>('itemType')
      .then((res?: HydratedIWeaponType | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('WeaponType'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, weaponStyle, icon, needTraining, itemType } = req.body;
  if (
    title === undefined ||
    weaponStyle === undefined ||
    itemType === undefined ||
    icon === undefined
  ) {
    res.status(400).send(gemInvalidField('Weapon Type'));

    return;
  }

  const weaponType = new WeaponType({
    title,
    summary,
    icon,
    itemType,
    needTraining,
    weaponStyle,
  });

  if (i18n !== null) {
    weaponType.i18n = JSON.stringify(i18n);
  }

  weaponType
    .save()
    .then(() => {
      res.send(weaponType);
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
    weaponStyle = null,
    icon = null,
    itemType = null,
    i18n,
    needTraining = null,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    icon: string | null;
    i18n: InternationalizationType | null;
    weaponStyle: ObjectId | null;
    itemType: ObjectId | null;
    needTraining: boolean | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Weapon Type ID'));

    return;
  }
  findWeaponTypeById(id)
    .then((weaponType) => {
      if (title !== null) {
        weaponType.title = title;
      }
      if (summary !== null) {
        weaponType.summary = summary;
      }
      if (weaponStyle !== null) {
        weaponType.weaponStyle = weaponStyle;
      }
      if (icon !== null) {
        weaponType.icon = icon;
      }
      if (needTraining !== null) {
        weaponType.needTraining = needTraining;
      }
      if (itemType !== null) {
        weaponType.itemType = itemType;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(weaponType.i18n !== undefined && weaponType.i18n !== ''
            ? JSON.parse(weaponType.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        weaponType.i18n = JSON.stringify(newIntl);
      }

      weaponType
        .save()
        .then(() => {
          res.send({
            message: 'Weapon Type was updated successfully!',
            weaponType,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('WeaponType'));
    });
};

const deleteWeaponTypeById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Weapon Type ID'));

      return;
    }
    WeaponType.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteWeaponType = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteWeaponTypeById(id)
    .then(() => {
      res.send({ message: 'Weapon Type was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIWeaponType {
  i18n?: InternationalizationType;
  weaponType: HydratedIWeaponType;
}

const findSingle = (req: Request, res: Response): void => {
  const { weaponTypeId } = req.query;
  if (weaponTypeId === undefined || typeof weaponTypeId !== 'string') {
    res.status(400).send(gemInvalidField('WeaponType ID'));

    return;
  }
  findWeaponTypeById(weaponTypeId)
    .then((weaponType) => {
      const sentObj = {
        weaponType,
        i18n: curateI18n(weaponType.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAllPromise = async (): Promise<CuratedIWeaponType[]> =>
  await new Promise((resolve, reject) => {
    findWeaponTypes()
      .then((weaponTypes) => {
        const curatedWeaponTypes: CuratedIWeaponType[] = [];

        weaponTypes.forEach((weaponType) => {
          curatedWeaponTypes.push({
            weaponType,
            i18n: curateI18n(weaponType.i18n),
          });
        });

        resolve(curatedWeaponTypes);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const findAll = (req: Request, res: Response): void => {
  findAllPromise()
    .then((weaponTypes) => {
      res.send(weaponTypes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteWeaponType,
  findAll,
  findAllPromise,
  findSingle,
  findWeaponTypeById,
  update,
};
