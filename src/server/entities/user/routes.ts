import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { findAll, findSingle, update, promote, demote } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/users/', [verifyToken, adminNeeded], findAll);

  app.get('/users/single', [verifyToken], findSingle);

  app.post('/users/update', [verifyToken], update);

  app.post('/users/promote', [verifyToken, adminNeeded], promote);

  app.post('/users/demote', [verifyToken, adminNeeded], demote);
};
