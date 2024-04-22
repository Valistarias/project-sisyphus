import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type IItemType } from '../itemType/model';
import { type IWeaponStyle } from '../weaponStyle/model';

import { type HydratedIWeaponType } from './model';

const { WeaponType } = db;

const findWeaponTypes = async (): Promise<HydratedIWeaponType[]> =>
  await new Promise((resolve, reject) => {
    WeaponType.find()
      .populate<{ weaponStyle: IWeaponStyle }>('weaponStyle')
      .populate<{ itemType: IItemType }>('itemType')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('WeaponTypes'));
        } else {
          resolve(res as HydratedIWeaponType[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findWeaponTypeById = async (id: string): Promise<HydratedIWeaponType> =>
  await new Promise((resolve, reject) => {
    WeaponType.findById(id)
      .populate<{ weaponStyle: IWeaponStyle }>('weaponStyle')
      .populate<{ itemType: IItemType }>('itemType')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('WeaponType'));
        } else {
          resolve(res as HydratedIWeaponType);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, weaponStyle, icon, needTraining, itemType } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
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
    .catch((err: Error) => {
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
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Weapon Type ID'));
    return;
  }
  findWeaponTypeById(id as string)
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
        const newIntl = {
          ...(weaponType.i18n !== null && weaponType.i18n !== undefined && weaponType.i18n !== ''
            ? JSON.parse(weaponType.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        weaponType.i18n = JSON.stringify(newIntl);
      }

      weaponType
        .save()
        .then(() => {
          res.send({ message: 'Weapon Type was updated successfully!', weaponType });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('WeaponType'));
    });
};

const deleteWeaponTypeById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Weapon Type ID'));
      return;
    }
    WeaponType.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteWeaponType = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteWeaponTypeById(id as string)
    .then(() => {
      res.send({ message: 'Weapon Type was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIWeaponType {
  i18n: Record<string, any> | Record<string, unknown>;
  weaponType: HydratedIWeaponType;
}

const curateWeaponType = (weaponType: HydratedIWeaponType): Record<string, any> => {
  if (weaponType.i18n === null || weaponType.i18n === '' || weaponType.i18n === undefined) {
    return {};
  }
  return JSON.parse(weaponType.i18n);
};

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
        i18n: curateWeaponType(weaponType),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findWeaponTypes()
    .then((weaponTypes) => {
      const curatedWeaponTypes: CuratedIWeaponType[] = [];

      weaponTypes.forEach((weaponType) => {
        curatedWeaponTypes.push({
          weaponType,
          i18n: curateWeaponType(weaponType),
        });
      });

      res.send(curatedWeaponTypes);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteWeaponType, findAll, findSingle, findWeaponTypeById, update };
