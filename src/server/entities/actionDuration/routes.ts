import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteActionDuration, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/actiondurations/', [verifyToken], findAll);

  app.get('/actiondurations/single', [verifyToken], findSingle);

  app.post('/actiondurations/create', [verifyToken, adminNeeded], create);

  app.post('/actiondurations/update', [verifyToken, adminNeeded], update);

  app.post('/actiondurations/delete', [verifyToken, adminNeeded], deleteActionDuration);
};
