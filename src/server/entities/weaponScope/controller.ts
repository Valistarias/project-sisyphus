import { type Request, type Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import { type HydratedIWeaponScope } from './model';

import { curateI18n } from '../../utils';

const { WeaponScope } = db;

const findWeaponScopes = async (): Promise<HydratedIWeaponScope[]> =>
  await new Promise((resolve, reject) => {
    WeaponScope.find()
      .then(async (res?: HydratedIWeaponScope[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('WeaponScopes'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findWeaponScopeById = async (id: string): Promise<HydratedIWeaponScope> =>
  await new Promise((resolve, reject) => {
    WeaponScope.findById(id)
      .then(async (res?: HydratedIWeaponScope | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('WeaponScope'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateWeaponScopeScopeId = async (
  scopeId: string,
  alreadyExistOnce: boolean = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    WeaponScope.find({ scopeId })
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
    checkDuplicateWeaponScopeScopeId(scopeId, alreadyExistOnce)
      .then((responseWeaponScope: string | boolean) => {
        if (typeof responseWeaponScope === 'boolean') {
          resolve(false);
        } else {
          resolve(responseWeaponScope);
        }
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, scopeId } = req.body;
  if (title === undefined || summary === undefined || scopeId === undefined) {
    res.status(400).send(gemInvalidField('Weapon Scope'));
    return;
  }

  checkDuplicateScopeId(scopeId as string, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const weaponScope = new WeaponScope({
          title,
          summary,
          scopeId,
        });

        if (i18n !== null) {
          weaponScope.i18n = JSON.stringify(i18n);
        }

        weaponScope
          .save()
          .then(() => {
            res.send(weaponScope);
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
    res.status(400).send(gemInvalidField('Weapon Scope ID'));
    return;
  }
  findWeaponScopeById(id as string)
    .then((weaponScope) => {
      const alreadyExistOnce = typeof scopeId === 'string' && scopeId === weaponScope.scopeId;
      checkDuplicateScopeId(scopeId as string, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              weaponScope.title = title;
            }
            if (scopeId !== null) {
              weaponScope.scopeId = scopeId;
            }
            if (summary !== null) {
              weaponScope.summary = summary;
            }

            if (i18n !== null) {
              const newIntl = {
                ...(weaponScope.i18n !== null &&
                weaponScope.i18n !== undefined &&
                weaponScope.i18n !== ''
                  ? JSON.parse(weaponScope.i18n)
                  : {}),
              };

              Object.keys(i18n as Record<string, any>).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              weaponScope.i18n = JSON.stringify(newIntl);
            }

            weaponScope
              .save()
              .then(() => {
                res.send({ message: 'Weapon Scope was updated successfully!', weaponScope });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('WeaponScope'));
          }
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Weapon Scope'));
    });
};

const deleteWeaponScopeById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Weapon Scope ID'));
      return;
    }
    WeaponScope.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteWeaponScope = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteWeaponScopeById(id as string)
    .then(() => {
      res.send({ message: 'Weapon Scope was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIWeaponScope {
  i18n: Record<string, any> | Record<string, unknown>;
  weaponScope: HydratedIWeaponScope;
}

const findSingle = (req: Request, res: Response): void => {
  const { weaponScopeId } = req.query;
  if (weaponScopeId === undefined || typeof weaponScopeId !== 'string') {
    res.status(400).send(gemInvalidField('WeaponScope ID'));
    return;
  }
  findWeaponScopeById(weaponScopeId)
    .then((weaponScope) => {
      const sentObj = {
        weaponScope,
        i18n: curateI18n(weaponScope.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findWeaponScopes()
    .then((weaponScopes) => {
      const curatedWeaponScopes: CuratedIWeaponScope[] = [];

      weaponScopes.forEach((weaponScope) => {
        curatedWeaponScopes.push({
          weaponScope,
          i18n: curateI18n(weaponScope.i18n),
        });
      });

      res.send(curatedWeaponScopes);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateWeaponScopeScopeId,
  create,
  deleteWeaponScope,
  findAll,
  findSingle,
  findWeaponScopeById,
  update,
};
