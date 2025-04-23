import type { Request, Response } from 'express';

import bcrypt from 'bcryptjs';

import { getUserFromToken, type IVerifyTokenRequest } from '../../middlewares/authJwt';
import db from '../../models';
import {
  gemInvalidField,
  gemNotAllowed,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { HydratedIUser } from './model';
import type { Lean } from '../../utils/types';
import type { IRole } from '../role/model';

import { checkIfAdminFromRoles, curateUser } from '../../utils';

const { User, Role } = db;

const findUsers = async (): Promise<HydratedIUser[]> =>
  await new Promise((resolve, reject) => {
    User.find()
      .populate<{ roles: Array<Lean<IRole>> }>('roles')
      .then((res?: HydratedIUser[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('User'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findUserById = async (id: string): Promise<HydratedIUser> =>
  await new Promise((resolve, reject) => {
    User.findById(id)
      .populate<{ roles: Array<Lean<IRole>> }>('roles')
      .then((res?: HydratedIUser | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('User'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCompleteUserById = async (
  id: string,
  req: Request
): Promise<{
  user: HydratedIUser;
  canEdit: boolean;
  isAdmin: boolean;
}> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((userSent) => {
        if (userSent === null) {
          reject(gemNotFound('User'));

          return;
        }
        User.findById(id)
          .populate<{ roles: Array<Lean<IRole>> }>('roles')
          .then((res?: HydratedIUser | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('User'));
            } else {
              resolve({
                user: res,
                canEdit: String(res._id) === String(userSent._id),
                isAdmin: checkIfAdminFromRoles(userSent.roles as Array<Lean<IRole>>),
              });
            }
          })
          .catch((err) => {
            reject(gemServerError(err));
          });
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const update = (req: Request, res: Response): void => {
  const {
    id,
    username = null,
    lang = null,
    oldPassword = null,
    password = null,
    theme = null,
    charCreationTips = null,
    scale = null,
  }: {
    id?: string;
    username: string | null;
    lang: string | null;
    oldPassword: string | null;
    password: string | null;
    theme: string | null;
    charCreationTips: boolean | null;
    scale: number | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('User ID'));

    return;
  }
  findCompleteUserById(id, req)
    .then(({ user, canEdit, isAdmin }) => {
      if (!canEdit && !isAdmin) {
        res.status(404).send(gemNotFound('User'));

        return;
      }

      if (username !== null) {
        user.username = username;
      }
      if (lang !== null) {
        user.lang = lang;
      }
      if (password !== null && (oldPassword !== null || (isAdmin && !canEdit))) {
        const passwordIsValid = bcrypt.compareSync(oldPassword ?? '', user.password);
        if (!passwordIsValid && !isAdmin) {
          res.status(400).send(gemInvalidField('password'));

          return;
        }
        const salt = bcrypt.genSaltSync(8);

        user.password = bcrypt.hashSync(password, salt);
      }
      if (theme !== null) {
        user.theme = theme;
      }
      if (scale !== null) {
        user.scale = scale;
      }
      if (charCreationTips !== null) {
        user.charCreationTips = charCreationTips;
      }

      user
        .save()
        .then(() => {
          const authorities: string[] = [];

          for (const role of user.roles) {
            if (typeof role === 'object') {
              authorities.push(`ROLE_${role.name.toUpperCase()}`);
            }
          }

          res.send(curateUser(user));
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('User'));
    });
};

const promote = (req: Request, res: Response): void => {
  const {
    userId,
  }: {
    userId?: string;
  } = req.body;
  if (userId === undefined) {
    res.status(400).send(gemInvalidField('User ID'));

    return;
  }
  findCompleteUserById(userId, req)
    .then(({ user, isAdmin }) => {
      if (!isAdmin) {
        res.status(404).send(gemNotFound('User'));

        return;
      }

      Role.find()
        .then((roles?: Array<Lean<IRole>> | null) => {
          const adminRole = roles?.find((role) => role.name === 'admin');
          if (adminRole === undefined) {
            res.status(403).send(gemNotAllowed());

            return;
          }
          if (checkIfAdminFromRoles(user.roles as Array<Lean<IRole>>)) {
            res.send(curateUser(user));

            return;
          }

          const fullRoles: Array<Lean<IRole>> = [...(user.roles as Array<Lean<IRole>>)];
          const rolesId = (user.roles as Array<Lean<IRole>>).map((role) => String(role._id));
          rolesId.push(String(adminRole._id));

          user.roles = rolesId;
          fullRoles.push(adminRole);

          user
            .save()
            .then(() => {
              const authorities: string[] = [];

              for (const role of fullRoles) {
                if (typeof role === 'object') {
                  authorities.push(`ROLE_${role.name.toUpperCase()}`);
                }
              }

              res.send({
                ...curateUser(user),
                roles: fullRoles,
              });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch(() => {
          res.status(403).send(gemNotAllowed());
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('User'));
    });
};

const demote = (req: Request, res: Response): void => {
  const {
    userId,
  }: {
    userId?: string;
  } = req.body;
  if (userId === undefined) {
    res.status(400).send(gemInvalidField('User ID'));

    return;
  }
  findCompleteUserById(userId, req)
    .then(({ user, isAdmin }) => {
      if (!isAdmin) {
        res.status(404).send(gemNotFound('User'));

        return;
      }

      Role.find()
        .then((roles?: Array<Lean<IRole>> | null) => {
          const adminRole = roles?.find((role) => role.name === 'admin');
          if (
            adminRole === undefined ||
            (user.roles as Array<Lean<IRole>>).find((role) => role.name === 'super') !== undefined
          ) {
            res.status(403).send(gemNotAllowed());

            return;
          }
          if (
            (user.roles as Array<Lean<IRole>>).find((role) => role.name === 'admin') === undefined
          ) {
            res.send(curateUser(user));

            return;
          }

          const fullRoles: Array<Lean<IRole>> = [];
          const rolesId: string[] = [];

          (user.roles as Array<Lean<IRole>>).forEach((role) => {
            if (role.name !== 'admin') {
              rolesId.push(String(role._id));
              fullRoles.push(role);
            }
          });

          user.roles = rolesId;

          user
            .save()
            .then((userClean) => {
              const authorities: string[] = [];

              for (const role of fullRoles) {
                if (typeof role === 'object') {
                  authorities.push(`ROLE_${role.name.toUpperCase()}`);
                }
              }

              res.send({
                ...curateUser(user),
                roles: fullRoles,
              });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch(() => {
          res.status(403).send(gemNotAllowed());
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('User'));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { userId } = req.query;
  if (userId === undefined || typeof userId !== 'string') {
    res.status(400).send(gemInvalidField('Weapon ID'));

    return;
  }
  findUserById(userId)
    .then((userSent) => {
      res.send(curateUser(userSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findUsers()
    .then((users) => {
      res.send(users.map((user) => curateUser(user)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { findUserById, update, findSingle, findAll, promote, demote };
