import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../../config/db.config';
import db from '../../models';

import { type HydratedIUser, type IRole, type IUser } from '../index';
import { type Request, type Response } from 'express';
import { type Error, type HydratedDocument } from 'mongoose';

const { User, Role } = db;

interface ISigninRequest extends Request {
  session: {
    token: string
  } | null
}

const signup = (req: Request, res: Response): void => {
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
      if (Array.isArray(req.body.roles)) {
        Role.find({ name: { $in: req.body.roles } })
          .then((roles) => {
            userRes.roles = roles.map((role) => role._id.toString());
            userRes.save()
              .then(() => { res.send({ message: 'User was registered successfully!' }); })
              .catch((err) => {
                res.status(418).send({ message: err });
              });
          })
          .catch((err: Error) => {
            res.status(418).send({ message: err });
          });
      } else {
        Role
          .findOne({ name: 'user' })
          .then((role) => {
            if (role !== null) {
              user.roles = [role._id.toString()];
              user.save()
                .then(() => { res.send({ message: 'User was registered successfully!' }); })
                .catch((err: Error) => {
                  res.status(418).send({ message: err });
                });
            }
          })
          .catch((error) => {
            res.status(418).send({ message: error });
          });
      }
    })
    .catch((err: Error) => {
      res.status(418).send({ message: err });
    });
};

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
