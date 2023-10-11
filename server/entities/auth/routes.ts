import { type Request, type Response, type Router } from 'express';

import { verifySignUp } from '../../middlewares';
import { type IMailgunClient } from 'mailgun.js/Interfaces';
import {
  signUp,
  signIn,
  signOut
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
      verifySignUp.checkDuplicateUsername,
      verifySignUp.checkRolesExisted
    ],
    (req: Request, res: Response) => {
      signUp(req, res, mg);
    }
  );

  app.post('/auth/signin', signIn);

  app.post('/auth/signout', signOut);
};
