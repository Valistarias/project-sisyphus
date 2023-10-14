import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import config from '../../config/db.config';
import db from '../../models';

import { type HydratedIUser, type IRole, type IUser } from '../index';
import { type Request, type Response } from 'express';
import { type Error, type HydratedDocument } from 'mongoose';
import { type IMailgunClient } from 'mailgun.js/Interfaces';
import { gM404, gM405 } from '../../utils/globalMessage';
import { findUserById } from '../user/controller';
import { removeToken } from '../mailToken/controller';

const { User, Role } = db;

interface IVerifyTokenRequest extends Request {
  userId: string
  session: {
    token: string
  }
}

interface ISigninRequest extends Request {
  session: {
    token: string
  } | null
}

const signUp = (req: Request, res: Response, mg: IMailgunClient): void => {
  const user = new User({
    mail: req.body.mail,
    password: bcrypt.hashSync(req.body.password, 8),
    lang: 'en-US',
    theme: 'dark',
    scale: 1
  });

  user
    .save()
    .then((userRes: HydratedDocument<IUser>) => {
      registerRoleByName(req.body.roles)
        .then((rolesId) => {
          user.roles = rolesId;
          user.save()
            .then(() => {
              const verifToken = jwt.sign(
                { ID: user._id },
                config.secret(process.env),
                { expiresIn: '7d' }
              );
              const url = `http://localhost:3000/verify/${verifToken}`;
              mg.messages.create('sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org', {
                from: 'Excited User <mailgun@sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org>',
                to: ['mallet.victor.france@gmail.com'],
                subject: 'Project Sisyphus - Registration',
                text: 'Click to confirm your email!',
                html: `Click <a href = '${url}'>here</a> to confirm your email.`
              })
                .then(msg => {
                  res.send({ message: 'User was registered successfully!' });
                }) // logs response data
                .catch((err: Error) => {
                  res.status(418).send({ message: err });
                });
            })
            .catch((err: Error) => {
              res.status(418).send({ message: err });
            });
        })
        .catch((err: Error) => {
          res.status(418).send({ message: err });
        });
    })
    .catch((err: Error) => {
      res.status(418).send({ message: err });
    });
};

const registerRoleByName = async (roles: string[] | undefined): Promise<string[]> => await new Promise((resolve, reject) => {
  if (Array.isArray(roles)) {
    // Attribute multiple roles
    Role.find({ name: { $in: roles } })
      .then((roles) => {
        resolve(roles.map((role) => role._id.toString()));
      })
      .catch((err: Error) => {
        reject(err);
      });
  } else {
    // Attribute only user
    Role
      .findOne({ name: 'user' })
      .then((role) => {
        if (role !== null) {
          resolve([role._id.toString()]);
        }
      })
      .catch((err: Error) => {
        reject(err);
      });
  }
});

const signIn = (req: ISigninRequest, res: Response): void => {
  User
    .findOne({ mail: req.body.mail })
    .populate<{ roles: IRole[] }>('roles', '-__v')
    .then((user: HydratedIUser) => {
      if (user === null) {
        res.status(404).send({ message: 'User Not found.' });
        return;
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        res.status(401).send({ message: 'Invalid Password!' });
        return;
      }

      if (!user.verified) {
        res.status(401).send({ message: 'User Not Verified' });
        return;
      }

      const token = jwt.sign({ id: user.id }, config.secret(process.env), {
        expiresIn: 86400 // 24 hours
      });

      if (req.session === null || req.session === undefined) {
        req.session = {
          token
        };
      } else {
        req.session.token = token;
      }

      res.status(200).send(user);
    })
    .catch((error) => {
      res.status(418).send({ message: error });
    });
};

const signOut = (req: ISigninRequest, res: Response): void => {
  req.session = null;
  res.status(200).send({ message: 'You\'ve been signed out!' });
};

const verifyTokenSingIn = async (token: string): Promise<boolean> => await new Promise((resolve, reject) => {
  let payload: JwtPayload | string | null = null;
  try {
    payload = jwt.verify(
      token,
      config.secret(process.env)
    );
  } catch (err) {
    reject(err);
  }
  try {
    if (payload === null || typeof payload === 'string') {
      reject(gM404('Token'));
    } else {
      User.findOne({
        _id: payload.IdMail
      })
        .then((user) => {
          if (user === null) {
            reject(gM404('User'));
          } else if (user.verified) {
            reject(gM405());
          } else {
            user.verified = true;
            user.save()
              .then(() => {
                resolve(true);
              })
              .catch((err: Error) => {
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
      res.status(404).send({ message: 'User Not found.' });
    });
};

const updatePassword = (req: Request, res: Response): void => {
  const {
    userId,
    pass,
    confirmPass
  } = req.body;
  if (pass !== confirmPass || pass === undefined || confirmPass === undefined) {
    res.status(404).send(gM404('Password'));
  } else {
    findUserById(userId)
      .then((user) => {
        removeToken(req)
          .then((isTokenDelete) => {
            if (!isTokenDelete) {
              res.status(404).send({ message: 'Token Not found.' });
            } else {
              user.password = bcrypt.hashSync(pass, 8);
              user.save()
                .then(() => {
                  res.send({ message: 'User was updated successfully!', user });
                })
                .catch((err) => {
                  res.status(418).send({ message: err });
                });
            }
          })
          .catch(() => {
            res.status(404).send({ message: 'Token Not found.' });
          });
      })
      .catch(() => {
        res.status(404).send({ message: 'User Not found.' });
      });
  }
};

export {
  signUp,
  signIn,
  signOut,
  verifyTokenSingIn,
  getLogged,
  updatePassword
};
