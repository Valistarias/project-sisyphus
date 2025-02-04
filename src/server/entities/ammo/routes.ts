import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteAmmo, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/ammos/', [verifyToken], findAll);

  app.get('/ammos/single', [verifyToken], findSingle);

  app.post('/ammos/create', [verifyToken, adminNeeded], create);

  app.post('/ammos/update', [verifyToken, adminNeeded], update);

  app.post('/ammos/delete', [verifyToken, adminNeeded], deleteAmmo);
};
