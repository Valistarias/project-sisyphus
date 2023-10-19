import bcrypt from 'bcryptjs';
import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedIUser } from './model';
import { type IRole } from '../role/model';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

const { User } = db;

const findUserById = async (id: string): Promise<HydratedIUser> => await new Promise((resolve, reject) => {
  User.findById(id)
    .populate<{ roles: IRole[] }>('roles')
    .then(async (res) => {
      if (res === undefined || res === null) {
        reject(gemNotFound('User'));
      } else {
        resolve(res as HydratedIUser);
      }
    })
    .catch(async (err) => {
      reject(err);
    });
});

const update = (req: Request, res: Response): void => {
  const {
    id,
    lang = null,
    mail = null,
    oldPass = null,
    newPass = null,
    theme = null,
    scale = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('User ID', req));
    return;
  }
  findUserById(id)
    .then((user) => {
      if (lang !== null) { user.lang = lang; }
      if (mail !== null) { user.mail = mail; }
      if (newPass !== null) {
        const passwordIsValid = bcrypt.compareSync(
          oldPass,
          user.password
        );
        if (!passwordIsValid) {
          res.status(400).send(gemInvalidField('Password'));
          return;
        }
        user.password = bcrypt.hashSync(newPass, 8);
      }
      if (theme !== null) { user.theme = theme; }
      if (scale !== null) { user.scale = scale; }

      user.save()
        .then(() => {
          const authorities: string[] = [];

          for (let i = 0; i < user.roles.length; i += 1) {
            if (typeof user.roles[i] === 'object') {
              authorities.push(`ROLE_${user.roles[i].name.toUpperCase()}`);
            }
          }
          const responsePayload = {
            id: user._id,
            mail: user.mail,
            roles: authorities,
            lang: user.lang,
            theme: user.theme,
            scale: user.scale
          };

          res.send({ message: 'User was updated successfully!', responsePayload });
        })
        .catch((err) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('User'));
    });
};

export {
  findUserById,
  update
};
