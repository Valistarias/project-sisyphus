import { type Request, type Response } from 'express';

import bcrypt from 'bcryptjs';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type IRole } from '../role/model';

import { type HydratedIUser } from './model';

const { User } = db;

const findUserById = async (id: string): Promise<HydratedIUser> =>
  await new Promise((resolve, reject) => {
    User.findById(id)
      .populate<{ roles: IRole[] }>('roles')
      .then(async (res?: HydratedIUser | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('User'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
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
    scale = null,
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('User ID'));
    return;
  }
  findUserById(id as string)
    .then((user) => {
      if (username !== null) {
        user.username = username;
      }
      if (lang !== null) {
        user.lang = lang;
      }
      if (newPass !== null) {
        const passwordIsValid = bcrypt.compareSync(oldPass as string, user.password);
        if (!passwordIsValid) {
          res.status(400).send(gemInvalidField('password'));
          return;
        }
        user.password = bcrypt.hashSync(newPass as string, 8);
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

          for (let i = 0; i < user.roles.length; i += 1) {
            if (typeof user.roles[i] === 'object') {
              authorities.push(`ROLE_${user.roles[i].name.toUpperCase()}`);
            }
          }

          res.send(user);
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('User'));
    });
};

export { findUserById, update };
