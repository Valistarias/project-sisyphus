import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemForbidden,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { InternationalizationType } from '../../utils/types';
import type { HydratedINode, HydratedISkill, ISkill, LeanINode } from '../index';
import type { HydratedISkillBranch, LeanISkillBranch } from './model';

import { curateI18n } from '../../utils';

const { SkillBranch } = db;

const findSkillBranches = async (): Promise<LeanISkillBranch[]> =>
  await new Promise((resolve, reject) => {
    SkillBranch.find()
      .lean()
      .populate<{ skill: ISkill }>('skill')
      .populate<{ nodes: LeanINode[] }>({
        path: 'nodes',
        select: '_id title summary icon',
        populate: ['effects', 'actions', 'skillBonuses', 'statBonuses', 'charParamBonuses'],
      })
      .then((res: LeanISkillBranch[]) => {
        if (res.length === 0) {
          reject(gemNotFound('SkillBranches'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findSkillBranchesBySkill = async (skillId: string): Promise<LeanISkillBranch[]> =>
  await new Promise((resolve, reject) => {
    SkillBranch.find({ skill: skillId })
      .lean()
      .populate<{ skill: ISkill }>('skill')
      .populate<{ nodes: LeanINode[] }>({
        path: 'nodes',
        select: '_id title summary icon',
        populate: ['effects', 'actions', 'skillBonuses', 'statBonuses', 'charParamBonuses'],
      })
      .then((res?: LeanISkillBranch[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBranches'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findSkillBranchById = async (id: string): Promise<LeanISkillBranch> =>
  await new Promise((resolve, reject) => {
    SkillBranch.findById(id)
      .lean()
      .populate<{ skill: ISkill }>('skill')
      .populate<{ nodes: LeanINode[] }>({
        path: 'nodes',
        select: '_id title summary icon',
        populate: ['effects', 'actions', 'skillBonuses', 'statBonuses', 'charParamBonuses'],
      })
      .then((res?: LeanISkillBranch | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBranch'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCompleteSkillBranchById = async (id: string): Promise<HydratedISkillBranch> =>
  await new Promise((resolve, reject) => {
    SkillBranch.findById(id)
      .populate<{ skill: HydratedISkill }>('skill')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summary icon',
      })
      .then((res?: HydratedISkillBranch | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBranch'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, skill, i18n = null } = req.body;
  if (title === undefined || summary === undefined || skill === undefined) {
    res.status(400).send(gemInvalidField('SkillBranch'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }

  const skillBranch: HydratedISkillBranch = new SkillBranch({
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
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const createGeneralForSkillId = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Skill ID'));

      return;
    }
    const skillBranch: HydratedISkillBranch = new SkillBranch({
      title: '_general',
      summary: '',
      skill: id,
    });
    skillBranch
      .save()
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    skill = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
    skill: ObjectId | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('SkillBranch ID'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }
  findCompleteSkillBranchById(id)
    .then((skillBranch) => {
      if (skillBranch.title === '_general') {
        res.status(403).send(gemForbidden());

        return;
      }
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
        const newIntl: InternationalizationType = {
          ...(skillBranch.i18n !== undefined && skillBranch.i18n !== ''
            ? JSON.parse(skillBranch.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        skillBranch.i18n = JSON.stringify(newIntl);
      }

      skillBranch
        .save()
        .then(() => {
          res.send({
            message: 'Skill branch was updated successfully!',
            skillBranch,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('SkillBranch'));
    });
};

const deleteSkillBranchById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Skill ID'));

      return;
    }
    findSkillBranchById(id)
      .then(({ title }) => {
        if (title === '_general') {
          reject(gemForbidden());
        } else {
          SkillBranch.findByIdAndDelete(id)
            .then(() => {
              resolve(true);
            })
            .catch((err: unknown) => {
              reject(gemServerError(err));
            });
        }
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteSkillBranch = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteSkillBranchById(id)
    .then(() => {
      res.send({ message: 'Skill branch was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(err);
    });
};

const deleteSkillBranchesBySkillId = async (skillId?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (skillId === undefined) {
      resolve(true);

      return;
    }
    SkillBranch.deleteMany({ skill: skillId })
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

interface CuratedISkillBranchToSend {
  skillBranch: Omit<LeanISkillBranch, 'skill'> & {
    skill: ISkill;
    nodes?: LeanINode[];
  };
  i18n?: InternationalizationType;
}

const curateSingleSkillBranch = (skillBranchSent: LeanISkillBranch): CuratedISkillBranchToSend => {
  const curatedNodes =
    skillBranchSent.nodes?.length !== undefined && skillBranchSent.nodes.length > 0
      ? skillBranchSent.nodes.map((node) => ({
          ...node,
          ...(node.i18n !== undefined ? { i18n: JSON.parse(node.i18n) } : {}),
        }))
      : [];

  const curatedSkill = {
    ...skillBranchSent.skill,
    ...(skillBranchSent.skill.i18n !== undefined
      ? { i18n: JSON.parse(skillBranchSent.skill.i18n) }
      : {}),
  };

  return {
    skillBranch: {
      ...skillBranchSent,
      nodes: curatedNodes,
      skill: curatedSkill,
    },
    i18n: curateI18n(skillBranchSent.i18n),
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { skillBranchId } = req.query;
  if (skillBranchId === undefined || typeof skillBranchId !== 'string') {
    res.status(400).send(gemInvalidField('SkillBranch ID'));

    return;
  }
  findSkillBranchById(skillBranchId)
    .then((skillBranchSent) => {
      res.send(curateSingleSkillBranch(skillBranchSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findSkillBranches()
    .then((skillBranches) => {
      const curatedSkillBranches: CuratedISkillBranchToSend[] = [];

      skillBranches.forEach((skillBranchSent) => {
        curatedSkillBranches.push(curateSingleSkillBranch(skillBranchSent));
      });

      res.send(curatedSkillBranches);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllBySkill = (req: Request, res: Response): void => {
  const { skillId } = req.query;
  if (skillId === undefined || typeof skillId !== 'string') {
    res.status(400).send(gemInvalidField('Skill ID'));

    return;
  }
  findSkillBranchesBySkill(skillId)
    .then((skillBranches) => {
      const curatedSkillBranches: CuratedISkillBranchToSend[] = [];

      skillBranches.forEach((skillBranchSent) => {
        curatedSkillBranches.push(curateSingleSkillBranch(skillBranchSent));
      });

      res.send(curatedSkillBranches);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  createGeneralForSkillId,
  deleteSkillBranch,
  deleteSkillBranchesBySkillId,
  findAll,
  findAllBySkill,
  findSingle,
  findSkillBranchById,
  findSkillBranchesBySkill,
  update,
};
