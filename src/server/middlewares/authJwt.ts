import type {
  Request, Response
} from 'express';

import jwt from 'jsonwebtoken';
import { pathToRegexp } from 'path-to-regexp';

import config from '../config/db.config';
import { findUserById } from '../entities/user/controller';
import {
  gemInvalidField,
  gemNotAdmin,
  gemServerError,
  gemUnauthorized
} from '../utils/globalErrorMessage';

import type { HydratedIUser } from '../entities';

interface IVerifyTokenRequest extends Request {
  userId: string
  session: { token: string } | null
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
    url: '/reset{/*param}',
    role: 'unlogged'
  },
  {
    url: '/signup',
    role: 'unlogged'
  },
  {
    url: '/rulebooks',
    role: 'logged'
  },
  {
    url: '/rulebook{/*param}',
    role: 'logged'
  },
  {
    url: '/campaigns',
    role: 'logged'
  },
  {
    url: '/campaign{/*param}',
    role: 'logged'
  },
  {
    url: '/characters',
    role: 'logged'
  },
  {
    url: '/character{/*param}',
    role: 'logged'
  },
  {
    url: '/subscribe{/*param}',
    role: 'logged'
  },
  {
    url: '/admin{/*param}',
    role: 'admin'
  }
];

const verifyToken = (
  req: IVerifyTokenRequest,
  res: Response,
  next?: () => void,
  mute?: boolean
): void => {
  const { session } = req;
  const secret = config.secret(process.env);

  if (session === null || secret === null) {
    res
      .status(mute !== undefined ? 200 : 403)
      .send(mute !== undefined ? {} : gemInvalidField('token'));

    return;
  }

  jwt.verify(
    session.token,
    secret,
    (err, decoded?: jwt.JwtPayload & { id: string }) => {
      if (err !== null || decoded === undefined) {
        const isMute = mute !== undefined;
        res.status(isMute ? 200 : 401).send(isMute ? {} : gemUnauthorized());

        return;
      }
      // Re-sign the token
      jwt.sign({ id: decoded.id }, secret, { expiresIn: 86400 }); // 24 hours
      req.userId = decoded.id;
      if (next !== undefined) {
        next();
      }
    }
  );
};

const getUserFromToken = async (
  req: IVerifyTokenRequest
): Promise<HydratedIUser | null> =>
  await new Promise((resolve, reject) => {
    const { session } = req;
    const secret = config.secret(process.env);
    if (session?.token !== undefined && secret !== null) {
      jwt.verify(
        session.token,
        secret,
        (err, decoded: jwt.JwtPayload & { id: string }) => {
          if (err !== null) {
            reject(err);
          }
          // Re-sign the token
          jwt.sign({ id: decoded.id }, secret, { expiresIn: 86400 }); // 24 hours
          findUserById(decoded.id)
            .then((user) => {
              resolve(user);
            })
            .catch((errFindUser) => {
              reject(errFindUser);
            });
        }
      );
    } else {
      resolve(null);
    }
  });

const isAdmin = async (req: IVerifyTokenRequest): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req)
      .then((user) => {
        if (
          user !== null
          && user.roles.length > 0
          && user.roles.some(role => role.name === 'admin')
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const generateVerificationMailToken = (userId: string): string | null => {
  const secret = config.secret(process.env);
  if (secret === null) {
    return null;
  }

  const verificationToken = jwt.sign(
    { IdMail: userId }, secret, { expiresIn: '7d' }
  );

  return verificationToken;
};

const adminNeeded = (
  req: IVerifyTokenRequest,
  res: Response,
  next: () => void
): void => {
  isAdmin(req)
    .then((boolCheck) => {
      if (boolCheck) {
        next();
      } else {
        res.status(403).send(gemNotAdmin());
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const checkRouteRights = (
  req: IVerifyTokenRequest,
  res: Response,
  next: () => void
): void => {
  const urlMatch = routes.find(
    route => pathToRegexp(route.url).regexp.exec(req.path) !== null
  );
  let rights = ['unlogged'];
  if (urlMatch === undefined || urlMatch.role === 'all') {
    next();
  } else {
    getUserFromToken(req)
      .then((user) => {
        if (user !== null && user.roles.length > 0) {
          rights = ['logged'];
          if (user.roles.some(role => role.name === 'admin')) {
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
      .catch((err: jwt.VerifyErrors) => {
        if (err.name === 'TokenExpiredError') {
          req.session = null;
          res.redirect('/');
        } else {
          next();
        }
      });
  }
};

export {
  adminNeeded,
  checkRouteRights,
  generateVerificationMailToken,
  getUserFromToken,
  isAdmin,
  verifyToken,
  type IVerifyTokenRequest
};
