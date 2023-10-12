import { type Router, type Response } from 'express';

import { type IVerifyTokenRequest, verifyToken } from '../../middlewares';

import {
  update
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
    '/users/update',
    [
      (req: IVerifyTokenRequest, res: Response, next: () => void) => {
        verifyToken(req, res, next);
      }
    ],
    update
  );
};
