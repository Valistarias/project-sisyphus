import { type Router } from 'express';

import { verifySignUp } from '../../middlewares';
import {
  signup,
  signinUser,
  signinAdmin,
  signout
} from './controller';

export default (app: Router): void => {
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
    signup
  );

  app.post('/auth/signinuser', signinUser);

  app.post('/auth/signinadmin', signinAdmin);

  app.post('/auth/signout', signout);
};
