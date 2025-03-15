import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';

import config from '../../config/db.config';
import db from '../../models';
import {
  gemInvalidField,
  gemNotAllowed,
  gemNotFound,
  gemServerError,
  gemUnverifiedUser,
} from '../../utils/globalErrorMessage';
import { removeToken } from '../mailToken/controller';
import { findUserById } from '../user/controller';

import type { HydratedIUser, IRole, IUser } from '../index';
import type { Interfaces } from 'mailgun.js/definitions';

const { User, Role } = db;

interface IVerifyTokenRequest extends Request {
  userId: string;
  session: { token: string };
}

interface ISigninRequest extends Request {
  session: { token: string } | null;
}

const signUp = (req: Request, res: Response, mg: Interfaces.IMailgunClient): void => {
  const { username, mail, password }: { username: string; mail: string; password: string } =
    req.body;
  const salt = bcrypt.genSaltSync(8);

  const user = new User({
    username,
    mail,
    password: bcrypt.hashSync(password, salt),
    lang: 'en',
    theme: 'dark',
    scale: 1,
  });

  user
    .save()
    .then((userRes: HydratedDocument<IUser>) => {
      registerRoleByName()
        .then((rolesId) => {
          user.roles = rolesId;
          user
            .save()
            .then(() => {
              const verifToken = jwt.sign(
                { IdMail: user._id },
                config.secret(process.env) as Secret,
                { expiresIn: '7d' }
              );
              const url = `http://localhost:3000/verify/${verifToken}`;
              mg.messages
                .create('sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org', {
                  from: 'Excited User <mailgun@sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org>',
                  to: ['mallet.victor.france@gmail.com'],
                  subject: 'Project Sisyphus - Registration',
                  text: 'Click to confirm your email!',
                  html: `Click <a href = '${url}'>here</a> to confirm your email.`,
                })
                .then(() => {
                  res.send({ message: 'User was registered successfully!' });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const registerRoleByName = async (): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    Role.findOne({ name: 'user' })
      .then((role) => {
        if (role !== null) {
          resolve([role._id.toString()]);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const signIn = (req: ISigninRequest, res: Response): void => {
  const { mail, password }: { mail: string; password: string } = req.body;
  User.findOne({ mail })
    .populate<{ roles: IRole[] }>('roles', '-__v')
    .then((user?: HydratedIUser | null) => {
      if (user === null || user === undefined) {
        res.status(404).send(gemNotFound('User'));

        return;
      }

      const passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
        res.status(400).send(gemInvalidField('password'));

        return;
      }

      if (!user.verified) {
        res.status(401).send(gemUnverifiedUser());

        return;
      }

      const token = jwt.sign(
        { id: user.id },
        config.secret(process.env) as Secret,
        { expiresIn: 86400 } // 24 hours
      );

      if (req.session === null) {
        req.session = { token };
      } else {
        req.session.token = token;
      }

      res.status(200).send(user);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const signOut = (req: ISigninRequest, res: Response): void => {
  req.session = null;
  res.status(200).send({ message: "You've been signed out!" });
};

const verifyTokenSingIn = async (token: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    let payload: JwtPayload | string | null = null;
    try {
      payload = jwt.verify(token, config.secret(process.env) as Secret);
    } catch (err) {
      reject(err);
    }
    try {
      if (payload === null || typeof payload === 'string') {
        reject(gemNotFound('Token'));
      } else {
        User.findOne({ _id: payload.IdMail })
          .then((user) => {
            if (user === null) {
              reject(gemNotFound('User'));
            } else if (user.verified) {
              reject(gemNotAllowed());
            } else {
              user.verified = true;
              user
                .save()
                .then(() => {
                  resolve(true);
                })
                .catch((err: unknown) => {
                  reject(err);
                });
            }
          })
          .catch((err) => {
            reject(err);
          });
      }
    } catch (err) {
      reject(err);
    }
  });

const getLogged = (req: IVerifyTokenRequest, res: Response): void => {
  findUserById(req.userId)
    .then((user) => {
      res.send(user);
    })
    .catch(() => {
      res.status(404).send(gemNotFound('User'));
    });
};

const updatePassword = (req: Request, res: Response): void => {
  const { userId, pass, confirmPass } = req.body;
  if (pass !== confirmPass || pass === undefined || confirmPass === undefined) {
    res.status(404).send(gemNotFound('Password'));
  } else {
    findUserById(userId as string)
      .then((user) => {
        removeToken(req)
          .then((isTokenDelete) => {
            if (!isTokenDelete) {
              res.status(404).send(gemNotFound('Token'));
            } else {
              user.password = bcrypt.hashSync(pass as string, 8);
              user
                .save()
                .then(() => {
                  res.send({ message: 'User was updated successfully!', user });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            }
          })
          .catch(() => {
            res.status(404).send(gemNotFound('Token'));
          });
      })
      .catch(() => {
        res.status(404).send(gemNotFound('User'));
      });
  }
};

export { getLogged, signIn, signOut, signUp, updatePassword, verifyTokenSingIn };
