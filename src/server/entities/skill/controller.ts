import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type HydratedISkillBranch, type IStat } from '../index';
import { createGeneralForSkillId, deleteSkillBranchesBySkillId } from '../skillBranch/controller';

import { type HydratedISkill } from './model';

const { Skill } = db;

const findSkills = async (): Promise<HydratedISkill[]> =>
  await new Promise((resolve, reject) => {
    Skill.find()
      .populate<{ stat: IStat }>('stat')
      .populate<{ branches: HydratedISkillBranch[] }>({
        path: 'branches',
        select: '_id title skill summary i18n',
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Skills'));
        } else {
          resolve(res as HydratedISkill[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findSkillById = async (id: string): Promise<HydratedISkill> =>
  await new Promise((resolve, reject) => {
    Skill.findById(id)
      .populate<{ stat: IStat }>('stat')
      .populate<{ branches: HydratedISkillBranch[] }>({
        path: 'branches',
        select: '_id title skill summary i18n',
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Skill'));
        } else {
          resolve(res as HydratedISkill);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, stat, i18n = null } = req.body;
  if (title === undefined || summary === undefined || stat === undefined) {
    res.status(400).send(gemInvalidField('Skill'));
    return;
  }

  const skill = new Skill({
    title,
    summary,
    stat,
  });

  if (i18n !== null) {
    skill.i18n = JSON.stringify(i18n);
  }

  skill
    .save()
    .then(() => {
      createGeneralForSkillId(String(skill._id))
        .then(() => {
          res.send(skill);
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, stat = null, i18n } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Skill ID'));
    return;
  }
  findSkillById(id as string)
    .then((skill) => {
      if (title !== null) {
        skill.title = title;
      }
      if (summary !== null) {
        skill.summary = summary;
      }
      if (stat !== null) {
        skill.stat = stat;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(skill.i18n !== null && skill.i18n !== undefined && skill.i18n !== ''
            ? JSON.parse(skill.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        skill.i18n = JSON.stringify(newIntl);
      }

      skill
        .save()
        .then(() => {
          res.send({ message: 'Skill was updated successfully!', skill });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Skill'));
    });
};

const deleteSkillById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Skill ID'));
      return;
    }
    deleteSkillBranchesBySkillId(id)
      .then(() => {
        Skill.findByIdAndDelete(id)
          .then(() => {
            resolve(true);
          })
          .catch((err: Error) => {
            reject(gemServerError(err));
          });
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteSkill = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteSkillById(id as string)
    .then(() => {
      res.send({ message: 'Skill was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedISkill {
  i18n: Record<string, any> | Record<string, unknown>;
  skill: HydratedISkill;
}

const curateSkill = (skill: HydratedISkill): Record<string, any> => {
  if (skill.i18n === null || skill.i18n === '' || skill.i18n === undefined) {
    return {};
  }
  return JSON.parse(skill.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { skillId } = req.query;
  if (skillId === undefined || typeof skillId !== 'string') {
    res.status(400).send(gemInvalidField('Skill ID'));
    return;
  }
  findSkillById(skillId)
    .then((skill) => {
      const sentObj = {
        skill,
        i18n: curateSkill(skill),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findSkills()
    .then((skills) => {
      const curatedSkills: CuratedISkill[] = [];

      skills.forEach((skill) => {
        curatedSkills.push({
          skill,
          i18n: curateSkill(skill),
        });
      });

      res.send(curatedSkills);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteSkill, findAll, findSingle, findSkillById, update };
