import type { Router } from 'express';

import {
  adminNeeded, verifyToken
} from '../../middlewares';

import {
  create, deleteStat, findAll, findSingle, update
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/stats/', [verifyToken], findAll);

  app.get('/stats/single', [verifyToken], findSingle);

  app.post('/stats/create', [verifyToken, adminNeeded], create);

  app.post('/stats/update', [verifyToken, adminNeeded], update);

  app.post('/stats/delete', [verifyToken, adminNeeded], deleteStat);
};
