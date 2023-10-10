import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import config from '../../config/db.config';
import db from '../../models';

import { type HydratedIUser, type IRole, type IUser } from '../index';
import { type Request, type Response } from 'express';
import { type Error, type HydratedDocument } from 'mongoose';
import { type IMailgunClient } from 'mailgun.js/Interfaces';

const { User, Role } = db;

interface ISigninRequest extends Request {
  session: {
    token: string
  } | null
}

const signup = (req: Request, res: Response, mg: IMailgunClient): void => {
  const user = new User({
    username: req.body.username,
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
              const url = `http://localhost:3000/api/verify/${verifToken}`;
              mg.messages.create('sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org', {
                from: 'Excited User <mailgun@sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org>',
                to: ['mallet.victor.france@gmail.com'],
                subject: 'Hello, this is a Singin attempt',
                text: 'Click to confirm your email!',
                html: `Click <a href = '${url}'>here</a> to confirm your email.`
              })
                .then(msg => {
                  console.log(msg);
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

const signinUser = (req: ISigninRequest, res: Response): void => {
  User
    .findOne({ username: req.body.username })
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

      const token = jwt.sign({ id: user.id }, config.secret(process.env), {
        expiresIn: 86400 // 24 hours
      });

      const authorities: string[] = [];

      for (let i = 0; i < user.roles.length; i += 1) {
        authorities.push(`ROLE_${user.roles[i].name.toUpperCase()}`);
      }

      if (req.session === null || req.session === undefined) {
        req.session = {
          token
        };
      } else {
        req.session.token = token;
      }

      res.status(200).send({
        id: user._id,
        username: user.username,
        lang: user.lang,
        theme: user.theme,
        scale: user.scale,
        roles: authorities
      });
    })
    .catch((error) => {
      res.status(418).send({ message: error });
    });
};

const signinAdmin = (req: ISigninRequest, res: Response): void => {
  User
    .findOne({ username: req.body.username })
    .populate<{ roles: IRole[] }>('roles', '-__v')
    .then((user: HydratedIUser) => {
      if (user === null) {
        res.status(404).send({ message: 'User Not found.' });
        return;
      }

      if (user.roles.length === 0 || user.roles.find((role: IRole) => role.name === 'admin') === undefined) {
        res.status(401).send({ message: 'Invalid Role!' });
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

      const token = jwt.sign({ id: user.id }, config.secret(process.env), {
        expiresIn: 86400 // 24 hours
      });

      const authorities: string[] = [];

      for (let i = 0; i < user.roles.length; i += 1) {
        authorities.push(`ROLE_${user.roles[i].name.toUpperCase()}`);
      }

      if (req.session === null || req.session === undefined) {
        req.session = {
          token
        };
      } else {
        req.session.token = token;
      }

      res.status(200).send({
        id: user._id,
        username: user.username,
        roles: authorities,
        lang: user.lang,
        theme: user.theme,
        scale: user.scale
      });
    })
    .catch((err: Error) => {
      res.status(418).send({ message: err });
    });
};

const signout = (req: ISigninRequest, res: Response): void => {
  req.session = null;
  res.status(200).send({ message: 'You\'ve been signed out!' });
};

export {
  signup,
  signinUser,
  signinAdmin,
  signout
};
