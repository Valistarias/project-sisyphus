import { type Router } from 'express';

import { verifyToken } from '../../middlewares';

import { update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.post('/users/update', [verifyToken], update);
};
