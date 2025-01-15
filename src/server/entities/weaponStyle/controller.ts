import type {
  Request, Response
} from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type { HydratedIWeaponStyle } from './model';
import type { InternationalizationType } from '../../utils/types';
import type { ISkill } from '../skill/model';

import { curateI18n } from '../../utils';

const { WeaponStyle } = db;

const findWeaponStyles = async (): Promise<HydratedIWeaponStyle[]> =>
  await new Promise((resolve, reject) => {
    WeaponStyle.find()
      .populate<{ skill: ISkill }>('skill')
      .then((res: HydratedIWeaponStyle[]) => {
        if (res.length === 0) {
          reject(gemNotFound('WeaponStyles'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findWeaponStyleById = async (id: string): Promise<HydratedIWeaponStyle> =>
  await new Promise((resolve, reject) => {
    WeaponStyle.findById(id)
      .populate<{ skill: ISkill }>('skill')
      .then((res?: HydratedIWeaponStyle | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('WeaponStyle'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title, summary, i18n = null, skill
  } = req.body;
  if (title === undefined || summary === undefined || skill === undefined) {
    res.status(400).send(gemInvalidField('Weapon Style'));

    return;
  }

  const weaponStyle = new WeaponStyle({
    title,
    summary,
    skill
  });

  if (i18n !== null) {
    weaponStyle.i18n = JSON.stringify(i18n);
  }

  weaponStyle
    .save()
    .then(() => {
      res.send(weaponStyle);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id, title = null, summary = null, skill = null, i18n
  }: {
    id?: string
    title: string | null
    summary: string | null
    icon: string | null
    i18n: InternationalizationType | null
    skill: ObjectId | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Weapon Style ID'));

    return;
  }
  findWeaponStyleById(id)
    .then((weaponStyle) => {
      if (title !== null) {
        weaponStyle.title = title;
      }
      if (summary !== null) {
        weaponStyle.summary = summary;
      }
      if (skill !== null) {
        weaponStyle.skill = skill;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(
          weaponStyle.i18n !== undefined && weaponStyle.i18n !== ''
            ? JSON.parse(weaponStyle.i18n)
            : {}
        ) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        weaponStyle.i18n = JSON.stringify(newIntl);
      }

      weaponStyle
        .save()
        .then(() => {
          res.send({
            message: 'Weapon Style was updated successfully!', weaponStyle
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('WeaponStyle'));
    });
};

const deleteWeaponStyleById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Weapon Style ID'));

      return;
    }
    WeaponStyle.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteWeaponStyle = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteWeaponStyleById(id)
    .then(() => {
      res.send({ message: 'Weapon Style was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIWeaponStyle {
  i18n?: InternationalizationType
  weaponStyle: HydratedIWeaponStyle
}

const findSingle = (req: Request, res: Response): void => {
  const { weaponStyleId } = req.query;
  if (weaponStyleId === undefined || typeof weaponStyleId !== 'string') {
    res.status(400).send(gemInvalidField('WeaponStyle ID'));

    return;
  }
  findWeaponStyleById(weaponStyleId)
    .then((weaponStyle) => {
      const sentObj = {
        weaponStyle,
        i18n: curateI18n(weaponStyle.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findWeaponStyles()
    .then((weaponStyles) => {
      const curatedWeaponStyles: CuratedIWeaponStyle[] = [];

      weaponStyles.forEach((weaponStyle) => {
        curatedWeaponStyles.push({
          weaponStyle,
          i18n: curateI18n(weaponStyle.i18n)
        });
      });

      res.send(curatedWeaponStyles);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteWeaponStyle, findAll, findSingle, findWeaponStyleById, update
};
