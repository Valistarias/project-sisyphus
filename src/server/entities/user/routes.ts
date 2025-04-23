import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { findAll, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/users/', [verifyToken, adminNeeded], findAll);

  app.post('/users/update', [verifyToken], update);
};
