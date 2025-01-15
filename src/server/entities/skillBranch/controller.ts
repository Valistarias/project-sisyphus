import type {
  Request, Response
} from 'express';
import type { FlattenMaps, HydratedDocument, ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemForbidden,
  gemInvalidField,
  gemNotFound,
  gemServerError
} from '../../utils/globalErrorMessage';

import type { ICuratedNodeToSend, ICuratedSkillToSend, InternationalizationType } from '../../utils/types';
import type { HydratedINode, HydratedISkill } from '../index';
import type {
  HydratedISkillBranch, ISkillBranch
} from './model';

import { curateI18n } from '../../utils';

const { SkillBranch } = db;

const findSkillBranches = async (): Promise<HydratedISkillBranch[]> =>
  await new Promise((resolve, reject) => {
    SkillBranch.find()
      .populate<{ skill: HydratedISkill }>('skill')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summarry icon'
      })
      .then((res: HydratedISkillBranch[]) => {
        if (res.length === 0) {
          reject(gemNotFound('SkillBranches'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findSkillBranchesBySkill = async (
  skillId: string
): Promise<HydratedISkillBranch[]> =>
  await new Promise((resolve, reject) => {
    SkillBranch.find({ skill: skillId })
      .populate<{ skill: HydratedISkill }>('skill')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summarry icon'
      })
      .then((res?: HydratedISkillBranch[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBranches'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findSkillBranchById = async (id: string): Promise<HydratedISkillBranch> =>
  await new Promise((resolve, reject) => {
    SkillBranch.findById(id)
      .populate<{ skill: HydratedISkill }>('skill')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summarry icon'
      })
      .then((res?: HydratedISkillBranch | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('SkillBranch'));
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
    title, summary, skill, i18n = null
  } = req.body;
  if (title === undefined || summary === undefined || skill === undefined) {
    res.status(400).send(gemInvalidField('SkillBranch'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }

  const skillBranch = new SkillBranch({
    title,
    summary,
    skill
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
    const skillBranch = new SkillBranch({
      title: '_general',
      summary: '',
      skill: id
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
    id, title = null, summary = null, skill = null, i18n
  }: {
    id?: string
    title: string | null
    summary: string | null
    i18n: InternationalizationType | null
    skill: ObjectId | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('SkillBranch ID'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }
  findSkillBranchById(id)
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
        const newIntl: InternationalizationType = { ...(
          skillBranch.i18n !== undefined
          && skillBranch.i18n !== ''
            ? JSON.parse(skillBranch.i18n)
            : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        skillBranch.i18n = JSON.stringify(newIntl);
      }

      skillBranch
        .save()
        .then(() => {
          res.send({
            message: 'Skill branch was updated successfully!', skillBranch
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

const deleteSkillBranchesBySkillId = async (
  skillId?: string
): Promise<boolean> =>
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
        i18n: curateI18n(skillBranch.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

interface ICuratedSkillBranch {
  skillBranch:
    Omit<
      FlattenMaps<ISkillBranch>
      , 'skill'
    > & {
      skill: ICuratedSkillToSend
      nodes?: ICuratedNodeToSend[]
    }
  i18n?: InternationalizationType
}

const findAll = (req: Request, res: Response): void => {
  findSkillBranches()
    .then((skillBranches: Array<HydratedDocument<
      Omit<
        FlattenMaps<ISkillBranch>
        , 'skill'
      > & {
        skill: HydratedISkill
        nodes?: HydratedINode[]
      }
    >>) => {
      const curatedSkillBranches: ICuratedSkillBranch[] = [];

      skillBranches.forEach((skillBranchSent) => {
        const curatedNodes = skillBranchSent.nodes?.length !== undefined
          && skillBranchSent.nodes.length > 0
          ? skillBranchSent.nodes.map((node) => {
              const data = node.toJSON();

              return {
                ...data,
                ...(
                  data.i18n !== undefined
                    ? { i18n: JSON.parse(data.i18n) }
                    : {}
                )
              };
            })
          : [];

        const curatedSkill = {
          ...skillBranchSent.skill.toJSON(),
          ...(
            skillBranchSent.skill.i18n !== undefined
              ? { i18n: JSON.parse(skillBranchSent.skill.i18n) }
              : {}
          )
        };
        const skillBranch: Omit<
          FlattenMaps<ISkillBranch>
          , 'skill'
        > & {
          skill: ICuratedSkillToSend
          nodes?: ICuratedNodeToSend[]
        } = skillBranchSent.toJSON();
        skillBranch.nodes = curatedNodes;
        skillBranch.skill = curatedSkill;
        curatedSkillBranches.push({
          skillBranch,
          i18n: curateI18n(skillBranchSent.i18n)
        });
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
    .then((skillBranches: Array<HydratedDocument<
      Omit<
        FlattenMaps<ISkillBranch>
        , 'skill'
      > & {
        skill: HydratedISkill
        nodes?: HydratedINode[]
      }
    >>) => {
      const curatedSkillBranches: ICuratedSkillBranch[] = [];

      skillBranches.forEach((skillBranchSent) => {
        const curatedNodes = skillBranchSent.nodes?.length !== undefined
          && skillBranchSent.nodes.length > 0
          ? skillBranchSent.nodes.map((node) => {
              const data = node.toJSON();

              return {
                ...data,
                ...(
                  data.i18n !== undefined
                    ? { i18n: JSON.parse(data.i18n) }
                    : {}
                )
              };
            })
          : [];

        const curatedSkill = {
          ...skillBranchSent.skill.toJSON(),
          ...(
            skillBranchSent.skill.i18n !== undefined
              ? { i18n: JSON.parse(skillBranchSent.skill.i18n) }
              : {}
          )
        };
        const skillBranch: Omit<
          FlattenMaps<ISkillBranch>
          , 'skill'
        > & {
          skill: ICuratedSkillToSend
          nodes?: ICuratedNodeToSend[]
        } = skillBranchSent.toJSON();
        skillBranch.nodes = curatedNodes;
        skillBranch.skill = curatedSkill;
        curatedSkillBranches.push({
          skillBranch,
          i18n: curateI18n(skillBranchSent.i18n)
        });
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
  update
};
