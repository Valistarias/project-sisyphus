import { type Request, type Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import { type HydratedIProgramScope } from './model';

import { curateI18n } from '../../utils';

const { ProgramScope } = db;

const findProgramScopes = async (): Promise<HydratedIProgramScope[]> =>
  await new Promise((resolve, reject) => {
    ProgramScope.find()
      .then(async (res?: HydratedIProgramScope[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ProgramScopes'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findProgramScopeById = async (id: string): Promise<HydratedIProgramScope> =>
  await new Promise((resolve, reject) => {
    ProgramScope.findById(id)
      .then(async (res?: HydratedIProgramScope | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ProgramScope'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateProgramScopeScopeId = async (
  scopeId: string,
  alreadyExistOnce: boolean = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    ProgramScope.find({ scopeId })
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

const checkDuplicateScopeId = async (
  scopeId: string,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    checkDuplicateProgramScopeScopeId(scopeId, alreadyExistOnce)
      .then((responseProgramScope: string | boolean) => {
        if (typeof responseProgramScope === 'boolean') {
          resolve(false);
        } else {
          resolve(responseProgramScope);
        }
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, scopeId } = req.body;
  if (title === undefined || summary === undefined || scopeId === undefined) {
    res.status(400).send(gemInvalidField('Program Scope'));
    return;
  }

  checkDuplicateScopeId(scopeId as string, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const programScope = new ProgramScope({
          title,
          summary,
          scopeId,
        });

        if (i18n !== null) {
          programScope.i18n = JSON.stringify(i18n);
        }

        programScope
          .save()
          .then(() => {
            res.send(programScope);
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
  const { id, title = null, summary = null, i18n, scopeId = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Program Scope ID'));
    return;
  }
  findProgramScopeById(id as string)
    .then((programScope) => {
      const alreadyExistOnce = typeof scopeId === 'string' && scopeId === programScope.scopeId;
      checkDuplicateScopeId(scopeId as string, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              programScope.title = title;
            }
            if (scopeId !== null) {
              programScope.scopeId = scopeId;
            }
            if (summary !== null) {
              programScope.summary = summary;
            }

            if (i18n !== null) {
              const newIntl = {
                ...(programScope.i18n !== null &&
                programScope.i18n !== undefined &&
                programScope.i18n !== ''
                  ? JSON.parse(programScope.i18n)
                  : {}),
              };

              Object.keys(i18n as Record<string, any>).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              programScope.i18n = JSON.stringify(newIntl);
            }

            programScope
              .save()
              .then(() => {
                res.send({ message: 'Program Scope was updated successfully!', programScope });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('ProgramScope'));
          }
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Program Scope'));
    });
};

const deleteProgramScopeById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Program Scope ID'));
      return;
    }
    ProgramScope.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteProgramScope = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteProgramScopeById(id as string)
    .then(() => {
      res.send({ message: 'Program Scope was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIProgramScope {
  i18n: Record<string, any> | Record<string, unknown>;
  programScope: HydratedIProgramScope;
}

const findSingle = (req: Request, res: Response): void => {
  const { programScopeId } = req.query;
  if (programScopeId === undefined || typeof programScopeId !== 'string') {
    res.status(400).send(gemInvalidField('ProgramScope ID'));
    return;
  }
  findProgramScopeById(programScopeId)
    .then((programScope) => {
      const sentObj = {
        programScope,
        i18n: curateI18n(programScope.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findProgramScopes()
    .then((programScopes) => {
      const curatedProgramScopes: CuratedIProgramScope[] = [];

      programScopes.forEach((programScope) => {
        curatedProgramScopes.push({
          programScope,
          i18n: curateI18n(programScope.i18n),
        });
      });

      res.send(curatedProgramScopes);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateProgramScopeScopeId,
  create,
  deleteProgramScope,
  findAll,
  findProgramScopeById,
  findSingle,
  update,
};
