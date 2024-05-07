import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedIArmorType } from './model';

import { curateI18n } from '../../utils';

const { ArmorType } = db;

const findArmorTypes = async (): Promise<HydratedIArmorType[]> =>
  await new Promise((resolve, reject) => {
    ArmorType.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ArmorTypes'));
        } else {
          resolve(res as HydratedIArmorType[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findArmorTypeById = async (id: string): Promise<HydratedIArmorType> =>
  await new Promise((resolve, reject) => {
    ArmorType.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ArmorType'));
        } else {
          resolve(res as HydratedIArmorType);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null } = req.body;
  if (title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('Armor Type'));
    return;
  }

  const armorType = new ArmorType({
    title,
    summary,
  });

  if (i18n !== null) {
    armorType.i18n = JSON.stringify(i18n);
  }

  armorType
    .save()
    .then(() => {
      res.send(armorType);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Armor Type ID'));
    return;
  }
  findArmorTypeById(id as string)
    .then((armorType) => {
      if (title !== null) {
        armorType.title = title;
      }
      if (summary !== null) {
        armorType.summary = summary;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(armorType.i18n !== null && armorType.i18n !== undefined && armorType.i18n !== ''
            ? JSON.parse(armorType.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        armorType.i18n = JSON.stringify(newIntl);
      }

      armorType
        .save()
        .then(() => {
          res.send({ message: 'Armor Type was updated successfully!', armorType });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Armor Type'));
    });
};

const deleteArmorTypeById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Armor Type ID'));
      return;
    }
    ArmorType.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteArmorType = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteArmorTypeById(id as string)
    .then(() => {
      res.send({ message: 'Armor Type was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIArmorType {
  i18n: Record<string, any> | Record<string, unknown>;
  armorType: HydratedIArmorType;
}

const findSingle = (req: Request, res: Response): void => {
  const { armorTypeId } = req.query;
  if (armorTypeId === undefined || typeof armorTypeId !== 'string') {
    res.status(400).send(gemInvalidField('ArmorType ID'));
    return;
  }
  findArmorTypeById(armorTypeId)
    .then((armorType) => {
      const sentObj = {
        armorType,
        i18n: curateI18n(armorType.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findArmorTypes()
    .then((armorTypes) => {
      const curatedArmorTypes: CuratedIArmorType[] = [];

      armorTypes.forEach((armorType) => {
        curatedArmorTypes.push({
          armorType,
          i18n: curateI18n(armorType.i18n),
        });
      });

      res.send(curatedArmorTypes);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteArmorType, findAll, findArmorTypeById, findSingle, update };
