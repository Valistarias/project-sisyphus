import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ISkill } from '../index';

import { type HydratedISkillBonus, type ISkillBonus } from './model';

const { SkillBonus } = db;

const findSkillBonuses = async (): Promise<HydratedISkillBonus[]> =>
  await new Promise((resolve, reject) => {
    SkillBonus.find()
      .populate<{ skill: ISkill }>('skill')
      .then(async (res: HydratedISkillBonus[]) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBonuses'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findSkillBonusById = async (id: string): Promise<HydratedISkillBonus> =>
  await new Promise((resolve, reject) => {
    SkillBonus.findById(id)
      .populate<{ skill: ISkill }>('skill')
      .then(async (res: HydratedISkillBonus) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBonus'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const createReadSkillBonus = (
  elts: Array<{
    skill: string;
    value: number;
  }>,
  ids: string[],
  cb: (err: Error | null, res?: string[]) => void
): void => {
  const actualElt = elts[0];
  SkillBonus.findOne(actualElt)
    .then(async (sentSkillBonus: HydratedDocument<ISkillBonus>) => {
      if (sentSkillBonus === undefined || sentSkillBonus === null) {
        // Need to create it
        const skillBonus = new SkillBonus(actualElt);

        skillBonus
          .save()
          .then(() => {
            ids.push(String(skillBonus._id));
            if (elts.length > 1) {
              elts.shift();
              createReadSkillBonus([...elts], ids, cb);
            } else {
              cb(null, ids);
            }
          })
          .catch(() => {
            cb(new Error('Error reading or creating skill bonus'));
          });
      } else {
        // Exists already
        ids.push(String(sentSkillBonus._id));
        if (elts.length > 1) {
          elts.shift();
          createReadSkillBonus([...elts], ids, cb);
        } else {
          cb(null, ids);
        }
      }
    })
    .catch(async () => {
      cb(new Error('Error reading or creating skill bonus'));
    });
};

const getSkillBonusIds = async (
  elts: Array<{
    skill: string;
    value: number;
  }>
): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    if (elts === undefined || elts.length === 0) {
      resolve([]);
      return;
    }
    createReadSkillBonus(elts, [], (err: Error | null, res?: string[]) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(res ?? []);
      }
    });
  });

const create = (req: Request, res: Response): void => {
  const { skill, value } = req.body;
  if (skill === undefined || value === undefined) {
    res.status(400).send(gemInvalidField('SkillBonus'));
    return;
  }

  const skillBonus = new SkillBonus({
    skill,
    value,
  });

  skillBonus
    .save()
    .then(() => {
      res.send(skillBonus);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, skill = null, value = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('SkillBonus ID'));
    return;
  }
  findSkillBonusById(id as string)
    .then((skillBonus) => {
      if (skill !== null) {
        skillBonus.skill = skill;
      }
      if (value !== null) {
        skillBonus.value = value;
      }

      skillBonus
        .save()
        .then(() => {
          res.send({ message: 'Skill bonus was updated successfully!', skillBonus });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('SkillBonus'));
    });
};

const deleteSkillBonusById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('SkillBonus ID'));
      return;
    }
    SkillBonus.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteSkillBonus = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteSkillBonusById(id as string)
    .then(() => {
      res.send({ message: 'Skill bonus was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { skillBonusId } = req.query;
  if (skillBonusId === undefined || typeof skillBonusId !== 'string') {
    res.status(400).send(gemInvalidField('SkillBonus ID'));
    return;
  }
  findSkillBonusById(skillBonusId)
    .then((skillBonus) => {
      res.send(skillBonus);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findSkillBonuses()
    .then((skillBonuses) => {
      res.send(skillBonuses);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteSkillBonus,
  findAll,
  findSingle,
  findSkillBonusById,
  getSkillBonusIds,
  update,
};
