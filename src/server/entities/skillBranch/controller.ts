import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ISkill } from '../index';

import { type HydratedISkillBranch } from './model';

const { SkillBranch } = db;

const findSkillBranches = async (): Promise<HydratedISkillBranch[]> =>
  await new Promise((resolve, reject) => {
    SkillBranch.find()
      .populate<{ skill: ISkill }>('skill')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBranches'));
        } else {
          resolve(res as HydratedISkillBranch[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findSkillBranchById = async (id: string): Promise<HydratedISkillBranch> =>
  await new Promise((resolve, reject) => {
    SkillBranch.findById(id)
      .populate<{ skill: ISkill }>('skill')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBranch'));
        } else {
          resolve(res as HydratedISkillBranch);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, skill, i18n = null } = req.body;
  if (title === undefined || summary === undefined || skill === undefined) {
    res.status(400).send(gemInvalidField('SkillBranch'));
    return;
  }

  const skillBranch = new SkillBranch({
    title,
    summary,
    skill,
  });

  if (i18n !== null) {
    skillBranch.i18n = JSON.stringify(i18n);
  }

  skillBranch
    .save()
    .then(() => {
      res.send(skillBranch);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, skill = null, i18n } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('SkillBranch ID'));
    return;
  }
  findSkillBranchById(id as string)
    .then((skillBranch) => {
      if (title !== null) {
        skillBranch.title = title;
      }
      if (summary !== null) {
        skillBranch.summary = summary;
      }
      if (skill !== null) {
        skillBranch.skill = skill;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(skillBranch.i18n !== null && skillBranch.i18n !== undefined && skillBranch.i18n !== ''
            ? JSON.parse(skillBranch.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        skillBranch.i18n = JSON.stringify(newIntl);
      }

      skillBranch
        .save()
        .then(() => {
          res.send({ message: 'Skill branch was updated successfully!', skillBranch });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('SkillBranch'));
    });
};

const deleteSkillBranchById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('SkillBranch ID'));
      return;
    }
    SkillBranch.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteSkillBranch = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteSkillBranchById(id as string)
    .then(() => {
      res.send({ message: 'Skill branch was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedISkillBranch {
  i18n: Record<string, any> | Record<string, unknown>;
  skillBranch: HydratedISkillBranch;
}

const curateSkillBranch = (skillBranch: HydratedISkillBranch): Record<string, any> => {
  if (skillBranch.i18n === null || skillBranch.i18n === '' || skillBranch.i18n === undefined) {
    return {};
  }
  return JSON.parse(skillBranch.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { skillBranchId } = req.query;
  if (skillBranchId === undefined || typeof skillBranchId !== 'string') {
    res.status(400).send(gemInvalidField('SkillBranch ID'));
    return;
  }
  findSkillBranchById(skillBranchId)
    .then((skillBranch) => {
      const sentObj = {
        skillBranch,
        i18n: curateSkillBranch(skillBranch),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findSkillBranches()
    .then((skillBranches) => {
      const curatedSkillBranches: CuratedISkillBranch[] = [];

      skillBranches.forEach((skillBranch) => {
        curatedSkillBranches.push({
          skillBranch,
          i18n: curateSkillBranch(skillBranch),
        });
      });

      res.send(curatedSkillBranches);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteSkillBranch, findAll, findSingle, findSkillBranchById, update };
