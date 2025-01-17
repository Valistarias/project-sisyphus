import type {
  Request, Response
} from 'express';
import type {
  FlattenMaps,
  ObjectId
} from 'mongoose';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError
} from '../../utils/globalErrorMessage';
import {
  createGeneralForSkillId,
  deleteSkillBranchesBySkillId
} from '../skillBranch/controller';
import { checkDuplicateStatFormulaId } from '../stat/controller';

import type { InternationalizationType } from '../../utils/types';
import type {
  HydratedINode,
  HydratedIStat, ISkillBranch, IStat
} from '../index';
import type {
  HydratedISkill, LeanISkill
} from './model';

import { curateI18n } from '../../utils';

const { Skill } = db;

const findSkills = async (): Promise<LeanISkill[]> =>
  await new Promise((resolve, reject) => {
    Skill.find()
      .lean()
      .populate<{ stat: IStat }>('stat')
      .populate<{ branches: Array<ISkillBranch & {
        nodes: HydratedINode[]
      }> }>({
        path: 'branches',
        select: '_id title skill summary i18n',
        populate: {
          path: 'nodes',
          select:
            '_id title summary icon i18n rank quote skillBranch effects actions skillBonuses skillBonuses statBonuses charParamBonuses',
          populate: [
            'effects',
            'actions',
            'skillBonuses',
            'skillBonuses',
            'statBonuses',
            'charParamBonuses'
          ]
        }
      })
      .then((res) => {
        if (res.length === 0) {
          reject(gemNotFound('Skills'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findSkillById = async (id: string): Promise<HydratedISkill> =>
  await new Promise((resolve, reject) => {
    Skill.findById(id)
      .populate<{ stat: HydratedIStat }>('stat')
      .populate<{ branches: Array<ISkillBranch & {
        nodes: HydratedINode[]
      }> }>({
        path: 'branches',
        select: '_id title skill summary i18n',
        populate: {
          path: 'nodes',
          select:
            '_id title summary icon i18n rank quote skillBranch effects actions skillBonuses skillBonuses statBonuses charParamBonuses',
          populate: [
            'effects',
            'actions',
            'skillBonuses',
            'skillBonuses',
            'statBonuses',
            'charParamBonuses'
          ]
        }
      })
      .then((res: HydratedISkill | null) => {
        if (res === null) {
          reject(gemNotFound('Skill'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const checkDuplicateSkillFormulaId = async (
  formulaId: string,
  alreadyExistOnce = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    Skill.find({ formulaId })
      .then((res) => {
        if (res.length === 0 || (alreadyExistOnce && res.length === 1)) {
          resolve(false);
        } else {
          resolve(res[0].title);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const checkDuplicateFormulaId = async (
  formulaId: string | null,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    if (formulaId === null) {
      resolve(false);
    } else {
      checkDuplicateSkillFormulaId(formulaId, alreadyExistOnce)
        .then((responseSkill: string | boolean) => {
          if (typeof responseSkill === 'boolean') {
            checkDuplicateStatFormulaId(formulaId, false)
              .then((responseStat: string | boolean) => {
                if (typeof responseStat === 'boolean') {
                  resolve(false);
                } else {
                  resolve(responseStat);
                }
              })
              .catch((err: unknown) => {
                reject(err);
              });
          } else {
            resolve(responseSkill);
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    }
  });

const create = (req: Request, res: Response): void => {
  const {
    title, summary, stat, i18n = null, formulaId
  }: {
    title?: string
    summary?: string
    stat?: string
    i18n?: InternationalizationType | null
    formulaId?: string
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || stat === undefined
    || formulaId === undefined
  ) {
    res.status(400).send(gemInvalidField('Skill'));

    return;
  }

  checkDuplicateFormulaId(formulaId, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const skill = new Skill({
          title,
          summary,
          formulaId,
          stat
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
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate(response));
      }
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id, title = null, summary = null, stat = null, i18n, formulaId = null
  }: {
    id?: string
    title: string | null
    summary: string | null
    stat: ObjectId | null
    i18n: InternationalizationType | null
    formulaId: string | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Skill ID'));

    return;
  }
  findSkillById(id)
    .then((skill) => {
      const alreadyExistOnce = typeof formulaId === 'string' && formulaId === skill.formulaId;
      checkDuplicateFormulaId(formulaId, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              skill.title = title;
            }
            if (summary !== null) {
              skill.summary = summary;
            }
            if (formulaId !== null) {
              skill.formulaId = formulaId;
            }
            if (stat !== null) {
              skill.stat = stat;
            }

            if (i18n !== null) {
              const newIntl: InternationalizationType = { ...(
                skill.i18n !== undefined
                && skill.i18n !== ''
                  ? JSON.parse(skill.i18n)
                  : {}) };

              Object.keys(i18n).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              skill.i18n = JSON.stringify(newIntl);
            }

            skill
              .save()
              .then(() => {
                res.send({
                  message: 'Skill was updated successfully!', skill
                });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemDuplicate(response));
          }
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Skill'));
    });
};

const deleteSkillById = async (id?: string): Promise<boolean> =>
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
          .catch((err: unknown) => {
            reject(gemServerError(err));
          });
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteSkill = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteSkillById(id)
    .then(() => {
      res.send({ message: 'Skill was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedISkill extends Omit<LeanISkill, 'branches'> {
  branches: Array<{
    skillBranch:
      Omit<
        FlattenMaps<ISkillBranch>
        , 'skill'
      > & {
        skill: ObjectId
      }
    i18n?: InternationalizationType
  }>
}

const findSingle = (req: Request, res: Response): void => {
  const { skillId } = req.query;
  if (skillId === undefined || typeof skillId !== 'string') {
    res.status(400).send(gemInvalidField('Skill ID'));

    return;
  }
  findSkillById(skillId)
    .then((skillSent) => {
      const data = skillSent.toJSON();
      const cleanSkill = {
        ...data,
        branches: data.branches.map((skillBranch) => {
          const curatedNodes = skillBranch.nodes.length > 0
            ? skillBranch.nodes.map((node) => {
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

          return {
            skillBranch: {
              ...skillBranch,
              nodes: curatedNodes
            },
            i18n: curateI18n(skillBranch.i18n)
          };
        })
      };

      const sentObj = {
        skill: cleanSkill,
        i18n: curateI18n(data.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findSkills()
    .then((skills) => {
      const curatedSkills: Array<{
        i18n?: InternationalizationType
        skill: CuratedISkill
      }> = [];

      skills.forEach((skill) => {
        const cleanSkill: CuratedISkill = {
          ...skill,
          branches: skill.branches.map((skillBranch) => {
            const curatedNodes = skillBranch.nodes.length > 0
              ? skillBranch.nodes.map((node) => {
                  const data = node;

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

            return {
              skillBranch: {
                ...skillBranch,
                nodes: curatedNodes
              },
              i18n: curateI18n(skillBranch.i18n)
            };
          })
        };

        curatedSkills.push({
          skill: cleanSkill,
          i18n: curateI18n(skill.i18n)
        });
      });

      res.send(curatedSkills);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateSkillFormulaId,
  create,
  deleteSkill,
  findAll,
  findSingle,
  findSkillById,
  update
};
