import type { Request, Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { HydratedIProgramScope } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { ProgramScope } = db;

const findProgramScopes = async (): Promise<HydratedIProgramScope[]> =>
  await new Promise((resolve, reject) => {
    ProgramScope.find()
      .then((res: HydratedIProgramScope[]) => {
        if (res.length === 0) {
          reject(gemNotFound('ProgramScopes'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findProgramScopeById = async (id: string): Promise<HydratedIProgramScope> =>
  await new Promise((resolve, reject) => {
    ProgramScope.findById(id)
      .then((res?: HydratedIProgramScope | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ProgramScope'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const checkDuplicateProgramScopeScopeId = async (
  scopeId: string,
  alreadyExistOnce = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    ProgramScope.find({ scopeId })
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

const checkDuplicateScopeId = async (
  scopeId: string | null,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    if (scopeId === null) {
      resolve(false);
    } else {
      checkDuplicateProgramScopeScopeId(scopeId, alreadyExistOnce)
        .then((responseProgramScope: string | boolean) => {
          if (typeof responseProgramScope === 'boolean') {
            resolve(false);
          } else {
            resolve(responseProgramScope);
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    }
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    i18n = null,
    scopeId,
  }: {
    title?: string;
    summary?: string;
    i18n?: InternationalizationType | null;
    scopeId?: string;
  } = req.body;
  if (title === undefined || summary === undefined || scopeId === undefined) {
    res.status(400).send(gemInvalidField('Program Scope'));

    return;
  }

  checkDuplicateScopeId(scopeId, false)
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
    id,
    title = null,
    summary = null,
    i18n,
    scopeId = null,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
    scopeId: string | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Program Scope ID'));

    return;
  }
  findProgramScopeById(id)
    .then((programScope) => {
      const alreadyExistOnce = typeof scopeId === 'string' && scopeId === programScope.scopeId;
      checkDuplicateScopeId(scopeId, alreadyExistOnce)
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
              const newIntl: InternationalizationType = {
                ...(programScope.i18n !== undefined && programScope.i18n !== ''
                  ? JSON.parse(programScope.i18n)
                  : {}),
              };

              Object.keys(i18n).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              programScope.i18n = JSON.stringify(newIntl);
            }

            programScope
              .save()
              .then(() => {
                res.send({
                  message: 'Program Scope was updated successfully!',
                  programScope,
                });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('ProgramScope'));
          }
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Program Scope'));
    });
};

const deleteProgramScopeById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Program Scope ID'));

      return;
    }
    ProgramScope.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteProgramScope = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteProgramScopeById(id)
    .then(() => {
      res.send({ message: 'Program Scope was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIProgramScope {
  i18n?: InternationalizationType;
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
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAllPromise = async (): Promise<CuratedIProgramScope[]> =>
  await new Promise((resolve, reject) => {
    findProgramScopes()
      .then((programScopes) => {
        const curatedProgramScopes: CuratedIProgramScope[] = [];

        programScopes.forEach((programScope) => {
          curatedProgramScopes.push({
            programScope,
            i18n: curateI18n(programScope.i18n),
          });
        });

        resolve(curatedProgramScopes);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const findAll = (req: Request, res: Response): void => {
  findAllPromise()
    .then((programScopes) => {
      res.send(programScopes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateProgramScopeScopeId,
  create,
  deleteProgramScope,
  findAll,
  findAllPromise,
  findProgramScopeById,
  findSingle,
  update,
};
