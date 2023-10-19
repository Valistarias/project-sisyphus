import { type Request, type Response, type Router } from 'express';

import { type IVerifyTokenRequest, verifyToken, verifySignUp } from '../../middlewares';
import { type IMailgunClient } from 'mailgun.js/Interfaces';
import {
  signUp,
  signIn,
  signOut,
  getLogged,
  updatePassword
} from './controller';

export default (app: Router, mg: IMailgunClient): void => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/auth/signup',
    [
      verifySignUp.checkDuplicateMail,
      verifySignUp.checkRolesExisted
    ],
    (req: Request, res: Response) => {
      signUp(req, res, mg);
    }
  );

  app.post('/auth/signin', signIn);

  app.get('/auth/check',
    [
      (req: IVerifyTokenRequest, res: Response, next: () => void) => {
        verifyToken(req, res, next, true);
      }
    ], getLogged);

  app.post('/auth/signout', signOut);

  app.post('/auth/passupdate', updatePassword);
};
