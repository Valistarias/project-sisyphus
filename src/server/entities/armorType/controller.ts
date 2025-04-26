import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIArmorType } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { ArmorType } = db;

const findArmorTypes = async (): Promise<HydratedIArmorType[]> =>
  await new Promise((resolve, reject) => {
    ArmorType.find()
      .then((res: HydratedIArmorType[]) => {
        if (res.length === 0) {
          reject(gemNotFound('ArmorTypes'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findArmorTypeById = async (id: string): Promise<HydratedIArmorType> =>
  await new Promise((resolve, reject) => {
    ArmorType.findById(id)
      .then((res?: HydratedIArmorType | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ArmorType'));
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
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Armor Type ID'));

    return;
  }
  findArmorTypeById(id)
    .then((armorType) => {
      if (title !== null) {
        armorType.title = title;
      }
      if (summary !== null) {
        armorType.summary = summary;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(armorType.i18n !== undefined && armorType.i18n !== ''
            ? JSON.parse(armorType.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        armorType.i18n = JSON.stringify(newIntl);
      }

      armorType
        .save()
        .then(() => {
          res.send({
            message: 'Armor Type was updated successfully!',
            armorType,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Armor Type'));
    });
};

const deleteArmorTypeById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Armor Type ID'));

      return;
    }
    ArmorType.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteArmorType = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteArmorTypeById(id)
    .then(() => {
      res.send({ message: 'Armor Type was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIArmorType {
  i18n?: InternationalizationType;
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
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAllPromise = async (): Promise<CuratedIArmorType[]> =>
  await new Promise((resolve, reject) => {
    findArmorTypes()
      .then((armorTypes) => {
        const curatedArmorTypes: CuratedIArmorType[] = [];

        armorTypes.forEach((armorType) => {
          curatedArmorTypes.push({
            armorType,
            i18n: curateI18n(armorType.i18n),
          });
        });
        resolve(curatedArmorTypes);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const findAll = (req: Request, res: Response): void => {
  findAllPromise()
    .then((armorTypes) => {
      res.send(armorTypes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteArmorType, findAll, findAllPromise, findArmorTypeById, findSingle, update };
