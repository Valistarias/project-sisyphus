import jwt from 'jsonwebtoken';
import db from '../models';
import config from '../config/db.config';

import { type Request, type Response } from 'express';
import { type HydratedIUser, type IRole } from '../entities';

const { User } = db;

interface IVerifyTokenRequest extends Request {
  userId: string
  session: {
    token: string
  }
}

interface IAdminNeededRequest extends Request {
  userId: string
}

const verifyToken = (req: IVerifyTokenRequest, res: Response, next: () => void): void => {
  const { token } = req.session;

  if (token === undefined) {
    res.status(403).send({ message: 'No token provided!' });
    return;
  }

  jwt.verify(token, config.secret(process.env), (err, decoded) => {
    if (err !== undefined) {
      res.status(401).send({ message: 'Unauthorized!' });
      return;
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = async (userId: string): Promise<boolean> => await new Promise((resolve, reject) => {
  User.findById(userId)
    .populate<{ roles: IRole[] }>({
    path: 'roles',
    match: {
      name: 'admin'
    }
  })
    .then((user: HydratedIUser) => {
      if (user !== null && user.roles.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
    .catch((err) => { reject(err); });
});

const adminNeeded = (req: IAdminNeededRequest, res: Response, next: () => void): void => {
  isAdmin(req.userId)
    .then((boolCheck) => {
      if (boolCheck) {
        next();
      } else {
        res.status(403).send({ message: 'Require Admin Role!' });
      }
    })
    .catch((err) => res.status(418).send({ message: err }));
};

export default {
  verifyToken,
  adminNeeded,
  isAdmin
};
