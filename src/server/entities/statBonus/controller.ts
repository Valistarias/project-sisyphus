import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type IStat } from '../index';

import { type HydratedIStatBonus } from './model';

const { StatBonus } = db;

const findStatBonuses = async (): Promise<HydratedIStatBonus[]> =>
  await new Promise((resolve, reject) => {
    StatBonus.find()
      .populate<{ stat: IStat }>('stat')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('StatBonuses'));
        } else {
          resolve(res as HydratedIStatBonus[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findStatBonusById = async (id: string): Promise<HydratedIStatBonus> =>
  await new Promise((resolve, reject) => {
    StatBonus.findById(id)
      .populate<{ stat: IStat }>('stat')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('StatBonus'));
        } else {
          resolve(res as HydratedIStatBonus);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { stat, value } = req.body;
  if (stat === undefined || value === undefined) {
    res.status(400).send(gemInvalidField('StatBonus'));
    return;
  }

  const statBonus = new StatBonus({
    stat,
    value,
  });

  statBonus
    .save()
    .then(() => {
      res.send(statBonus);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, stat = null, value = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('StatBonus ID'));
    return;
  }
  findStatBonusById(id as string)
    .then((statBonus) => {
      if (stat !== null) {
        statBonus.stat = stat;
      }
      if (value !== null) {
        statBonus.value = value;
      }

      statBonus
        .save()
        .then(() => {
          res.send({ message: 'Stat bonus was updated successfully!', statBonus });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('StatBonus'));
    });
};

const deleteStatBonusById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('StatBonus ID'));
      return;
    }
    StatBonus.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteStatBonus = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteStatBonusById(id as string)
    .then(() => {
      res.send({ message: 'Stat bonus was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { statBonusId } = req.query;
  if (statBonusId === undefined || typeof statBonusId !== 'string') {
    res.status(400).send(gemInvalidField('StatBonus ID'));
    return;
  }
  findStatBonusById(statBonusId)
    .then((statBonus) => {
      res.send(statBonus);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findStatBonuses()
    .then((statBonuses) => {
      res.send(statBonuses);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteStatBonus, findAll, findSingle, findStatBonusById, update };
