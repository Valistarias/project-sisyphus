import type { Request, Response, Router } from 'express';

import { type IVerifyTokenRequest, verifyToken, verifySignUp } from '../../middlewares';

import { signUp, signIn, signOut, getLogged, getGlobal, updatePassword } from './controller';

import type { Interfaces } from 'mailgun.js/definitions';

export default (app: Router, mg: Interfaces.IMailgunClient): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.post(
    '/auth/signup',
    [verifySignUp.checkDuplicateMail, verifySignUp.checkRolesExisted],
    (req: Request, res: Response) => {
      signUp(req, res, mg);
    }
  );

  app.post('/auth/signin', signIn);

  app.get(
    '/auth/check',
    [
      (req: IVerifyTokenRequest, res: Response, next: () => void) => {
        verifyToken(req, res, next, true);
      },
    ],
    getLogged
  );

  app.post('/auth/signout', signOut);

  app.post('/auth/passupdate', updatePassword);

  app.get(
    '/auth/getglobal',
    [
      (req: IVerifyTokenRequest, res: Response, next: () => void) => {
        verifyToken(req, res, next, true);
      },
    ],
    getGlobal
  );
};
