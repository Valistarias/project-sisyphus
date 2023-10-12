import jwt from 'jsonwebtoken';
import db from '../models';
import config from '../config/db.config';

import { type Request, type Response } from 'express';
import { type HydratedIUser, type IRole } from '../entities';
import { findUserById } from '../entities/auth/controller';
import { gM404 } from '../utils/globalMessage';

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

const routes = [
  {
    url: '/',
    role: 'all'
  },
  {
    url: '/signup',
    role: 'unlogged'
  },
  {
    url: '/login',
    role: 'unlogged'
  },
  {
    url: '/dashboard',
    role: 'logged'
  },
  {
    url: '/back',
    role: 'admin'
  }
];

const verifyToken = (req: IVerifyTokenRequest, res: Response, next: () => void, mute?: boolean): void => {
  const { token } = req.session;

  if (token === undefined) {
    res.status(mute !== undefined ? 200 : 403).send(mute !== undefined ? {} : { message: 'No token provided!' });
    return;
  }

  jwt.verify(token, config.secret(process.env), (err, decoded) => {
    if (err !== null) {
      res.status(mute !== undefined ? 200 : 401).send(mute !== undefined ? {} : { message: 'Unauthorized!' });
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

const generateVerificationMailToken = (userId: string): string => {
  const verificationToken = jwt.sign(
    { IdMail: userId },
    config.secret(process.env),
    { expiresIn: '7d' }
  );
  return verificationToken;
};

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

const getUserRolesFromToken = async (req: IVerifyTokenRequest): Promise<IRole[]> => await new Promise((resolve, reject) => {
  const { token } = req.session;
  if (token !== undefined) {
    jwt.verify(token, config.secret(process.env), (err, decoded) => {
      if (err !== null) {
        reject(err);
      }
      findUserById(decoded.id)
        .then((user) => {
          if (user === undefined) {
            reject(gM404('User'));
          }
          resolve(user.roles);
        })
        .catch((errFindUser) => {
          reject(errFindUser);
        });
    });
  } else {
    resolve([]);
  }
});

const checkRouteRights = (req: Request, res: Response, next: () => void): void => {
  const urlMatch = routes.find((route) => route.url === req.path);
  let rights = ['unlogged'];
  if (urlMatch === undefined || urlMatch.role === 'all') {
    next();
  } else {
    getUserRolesFromToken(req as IVerifyTokenRequest)
      .then((roles) => {
        if (roles.length > 0) {
          rights = ['logged'];
          if (roles.some((role) => role.name === 'admin')) {
            rights.push('admin');
          }
        }
        if (urlMatch.role === 'logged' || urlMatch.role === 'admin') {
          if (rights.includes(urlMatch.role)) {
            next();
          } else {
            res.redirect('/login');
          }
        } else if (urlMatch.role === 'unlogged') {
          if (rights.includes(urlMatch.role)) {
            next();
          } else {
            res.redirect('/');
          }
        }
      })
      .catch((err) => {
        console.error(err);
        next();
      });
  }
};

export {
  verifyToken,
  adminNeeded,
  generateVerificationMailToken,
  isAdmin,
  checkRouteRights,
  type IVerifyTokenRequest
};
