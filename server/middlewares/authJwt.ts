import jwt from 'jsonwebtoken';
import config from '../config/db.config';

import { type Request, type Response } from 'express';
import { type IRole } from '../entities';
import { findUserById } from '../entities/user/controller';
import { gemInvalidField, gemNotAdmin, gemNotFound, gemServerError, gemUnauthorized } from '../utils/globalErrorMessage';
import { pathToRegexp } from 'path-to-regexp';

interface IVerifyTokenRequest extends Request {
  userId: string
  session: {
    token: string
  }
}

const routes = [
  {
    url: '/',
    role: 'all'
  },
  {
    url: '/login',
    role: 'unlogged'
  },
  {
    url: '/reset/:param*',
    role: 'unlogged'
  },
  {
    url: '/signup',
    role: 'unlogged'
  },
  {
    url: '/dashboard',
    role: 'logged'
  },
  {
    url: '/rulebooks',
    role: 'logged'
  },
  {
    url: '/rulebook/:param*',
    role: 'logged'
  },
  {
    url: '/admin/:param*',
    role: 'admin'
  }
];

const verifyToken = (req: IVerifyTokenRequest, res: Response, next: () => void, mute?: boolean): void => {
  const { token } = req.session;

  if (token === undefined) {
    res.status(mute !== undefined ? 200 : 403).send(mute !== undefined ? {} : gemInvalidField('token'));
    return;
  }

  jwt.verify(token, config.secret(process.env), (err, decoded) => {
    if (err !== null) {
      res.status(mute !== undefined ? 200 : 401).send(mute !== undefined ? {} : gemUnauthorized());
      return;
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = async (req: Request): Promise<boolean> => await new Promise((resolve, reject) => {
  getUserRolesFromToken(req as IVerifyTokenRequest)
    .then((roles) => {
      if (roles.length > 0 && roles.some((role) => role.name === 'admin')) {
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

const adminNeeded = (req: Request, res: Response, next: () => void): void => {
  isAdmin(req)
    .then((boolCheck) => {
      if (boolCheck) {
        next();
      } else {
        res.status(403).send(gemNotAdmin());
      }
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
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
            reject(gemNotFound('User'));
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
  const urlMatch = routes.find((route) => pathToRegexp(route.url).exec(req.path) !== null);
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
        if (urlMatch.role === 'logged') {
          if (rights.includes(urlMatch.role)) {
            next();
          } else {
            res.redirect('/login');
          }
        } else if (urlMatch.role === 'unlogged' || urlMatch.role === 'admin') {
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
