import { type Request, type Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';
import { checkDuplicateSkillFormulaId } from '../skill/controller';
import { checkDuplicateStatFormulaId } from '../stat/controller';

import { type HydratedICharParam } from './model';

import { curateI18n } from '../../utils';

const { CharParam } = db;

const findCharParams = async (): Promise<HydratedICharParam[]> =>
  await new Promise((resolve, reject) => {
    CharParam.find()
      .then(async (res?: HydratedICharParam[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CharParams'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findCharParamById = async (id: string): Promise<HydratedICharParam> =>
  await new Promise((resolve, reject) => {
    CharParam.findById(id)
      .then(async (res?: HydratedICharParam | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CharParam'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateCharParamFormulaId = async (
  formulaId: string,
  alreadyExistOnce: boolean = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    CharParam.find({ formulaId })
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
    checkDuplicateCharParamFormulaId(formulaId, alreadyExistOnce)
      .then((responseCharParam: string | boolean) => {
        if (typeof responseCharParam === 'boolean') {
          checkDuplicateSkillFormulaId(formulaId, false)
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
    res.status(400).send(gemInvalidField('CharParam'));
    return;
  }
  checkDuplicateFormulaId(formulaId as string, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const charParam = new CharParam({
          title,
          summary,
          formulaId,
          short,
        });

        if (i18n !== null) {
          charParam.i18n = JSON.stringify(i18n);
        }

        charParam
          .save()
          .then(() => {
            res.send(charParam);
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
    res.status(400).send(gemInvalidField('CharParam ID'));
    return;
  }
  findCharParamById(id as string)
    .then((charParam) => {
      const alreadyExistOnce = typeof formulaId === 'string' && formulaId === charParam.formulaId;
      checkDuplicateFormulaId(formulaId as string, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              charParam.title = title;
            }
            if (summary !== null) {
              charParam.summary = summary;
            }
            if (formulaId !== null) {
              charParam.formulaId = formulaId;
            }
            if (short !== null) {
              charParam.short = short;
            }

            if (i18n !== null) {
              const newIntl = {
                ...(charParam.i18n !== null && charParam.i18n !== undefined && charParam.i18n !== ''
                  ? JSON.parse(charParam.i18n)
                  : {}),
              };

              Object.keys(i18n as Record<string, any>).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              charParam.i18n = JSON.stringify(newIntl);
            }

            charParam
              .save()
              .then(() => {
                res.send({ message: 'CharParam was updated successfully!', charParam });
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
    })
    .catch(() => {
      res.status(404).send(gemNotFound('CharParam'));
    });
};

const deleteCharParamById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('CharParam ID'));
      return;
    }
    CharParam.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteCharParam = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteCharParamById(id as string)
    .then(() => {
      res.send({ message: 'CharParam was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedICharParam {
  i18n: Record<string, any> | Record<string, unknown>;
  charParam: HydratedICharParam;
}

const findSingle = (req: Request, res: Response): void => {
  const { charParamId } = req.query;
  if (charParamId === undefined || typeof charParamId !== 'string') {
    res.status(400).send(gemInvalidField('CharParam ID'));
    return;
  }
  findCharParamById(charParamId)
    .then((charParam) => {
      const sentObj = {
        charParam,
        i18n: curateI18n(charParam.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findCharParams()
    .then((charParams) => {
      const curatedCharParams: CuratedICharParam[] = [];

      charParams.forEach((charParam) => {
        curatedCharParams.push({
          charParam,
          i18n: curateI18n(charParam.i18n),
        });
      });

      res.send(curatedCharParams);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateCharParamFormulaId,
  create,
  deleteCharParam,
  findAll,
  findCharParamById,
  findSingle,
  update,
};
