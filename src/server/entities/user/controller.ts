import type {
  Request, Response
} from 'express';

import bcrypt from 'bcryptjs';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type { HydratedIUser } from './model';
import type { IRole } from '../role/model';

const { User } = db;

const findUserById = async (id: string): Promise<HydratedIUser> =>
  await new Promise((resolve, reject) => {
    User.findById(id)
      .populate<{ roles: IRole[] }>('roles')
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

const update = (req: Request, res: Response): void => {
  const {
    id,
    username = null,
    lang = null,
    oldPass = null,
    newPass = null,
    theme = null,
    charCreationTips = null,
    scale = null
  }: {
    id?: string
    username: string | null
    lang: string | null
    oldPass: string | null
    newPass: string | null
    theme: string | null
    charCreationTips: boolean | null
    scale: number | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('User ID'));

    return;
  }
  findUserById(id)
    .then((user) => {
      if (username !== null) {
        user.username = username;
      }
      if (lang !== null) {
        user.lang = lang;
      }
      if (newPass !== null && oldPass !== null) {
        const passwordIsValid = bcrypt.compareSync(oldPass, user.password);
        if (!passwordIsValid) {
          res.status(400).send(gemInvalidField('password'));

          return;
        }
        user.password = bcrypt.hashSync(newPass, 8);
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

          res.send(user);
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('User'));
    });
};

export {
  findUserById, update
};
