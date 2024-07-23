import { type Request, type Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';
import { checkDuplicateCharParamFormulaId } from '../charParam/controller';
import { checkDuplicateSkillFormulaId } from '../skill/controller';

import { type HydratedIStat } from './model';

import { curateI18n } from '../../utils';

const { Stat } = db;

const findStats = async (): Promise<HydratedIStat[]> =>
  await new Promise((resolve, reject) => {
    Stat.find()
      .then(async (res?: HydratedIStat[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Stats'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findStatById = async (id: string): Promise<HydratedIStat> =>
  await new Promise((resolve, reject) => {
    Stat.findById(id)
      .then(async (res?: HydratedIStat | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Stat'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateStatFormulaId = async (
  formulaId: string,
  alreadyExistOnce: boolean = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    Stat.find({ formulaId })
      .then(async (res) => {
        if (res.length === 0 || (alreadyExistOnce && res.length === 1)) {
          resolve(false);
        } else {
          resolve(res[0].title);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateFormulaId = async (
  formulaId: string,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    checkDuplicateCharParamFormulaId(formulaId, false)
      .then((responseCharParam: string | boolean) => {
        if (typeof responseCharParam === 'boolean') {
          checkDuplicateSkillFormulaId(formulaId, false)
            .then((responseSkill: string | boolean) => {
              if (typeof responseSkill === 'boolean') {
                checkDuplicateStatFormulaId(formulaId, alreadyExistOnce)
                  .then((responseStat: string | boolean) => {
                    if (typeof responseStat === 'boolean') {
                      resolve(false);
                    } else {
                      resolve(responseStat);
                    }
                  })
                  .catch((err: Error) => {
                    reject(err);
                  });
              } else {
                resolve(responseSkill);
              }
            })
            .catch((err: Error) => {
              reject(err);
            });
        } else {
          resolve(responseCharParam);
        }
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, short, i18n = null, formulaId } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    short === undefined ||
    formulaId === undefined
  ) {
    res.status(400).send(gemInvalidField('Stat'));
    return;
  }

  checkDuplicateFormulaId(formulaId as string, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const stat = new Stat({
          title,
          summary,
          short,
          formulaId,
        });

        if (i18n !== null) {
          stat.i18n = JSON.stringify(i18n);
        }

        stat
          .save()
          .then(() => {
            res.send(stat);
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate(response));
      }
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n, short = null, formulaId = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Stat ID'));
    return;
  }
  findStatById(id as string)
    .then((stat) => {
      const alreadyExistOnce = typeof formulaId === 'string' && formulaId === stat.formulaId;
      checkDuplicateFormulaId(formulaId as string, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              stat.title = title;
            }
            if (formulaId !== null) {
              stat.formulaId = formulaId;
            }
            if (summary !== null) {
              stat.summary = summary;
            }
            if (short !== null) {
              stat.short = short;
            }

            if (i18n !== null) {
              const newIntl = {
                ...(stat.i18n !== null && stat.i18n !== undefined && stat.i18n !== ''
                  ? JSON.parse(stat.i18n)
                  : {}),
              };

              Object.keys(i18n as Record<string, any>).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              stat.i18n = JSON.stringify(newIntl);
            }

            stat
              .save()
              .then(() => {
                res.send({ message: 'Stat was updated successfully!', stat });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('CharParam'));
          }
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Stat'));
    });
};

const deleteStatById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Stat ID'));
      return;
    }
    Stat.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteStat = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteStatById(id as string)
    .then(() => {
      res.send({ message: 'Stat was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIStat {
  i18n: Record<string, any> | Record<string, unknown>;
  stat: HydratedIStat;
}

const findSingle = (req: Request, res: Response): void => {
  const { statId } = req.query;
  if (statId === undefined || typeof statId !== 'string') {
    res.status(400).send(gemInvalidField('Stat ID'));
    return;
  }
  findStatById(statId)
    .then((stat) => {
      const sentObj = {
        stat,
        i18n: curateI18n(stat.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findStats()
    .then((stats) => {
      const curatedStats: CuratedIStat[] = [];

      stats.forEach((stat) => {
        curatedStats.push({
          stat,
          i18n: curateI18n(stat.i18n),
        });
      });

      res.send(curatedStats);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateStatFormulaId,
  create,
  deleteStat,
  findAll,
  findSingle,
  findStatById,
  update,
};
