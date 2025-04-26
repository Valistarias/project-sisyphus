import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteVow, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/vows/', [verifyToken], findAll);

  app.get('/vows/single', [verifyToken], findSingle);

  app.post('/vows/create', [verifyToken, adminNeeded], create);

  app.post('/vows/update', [verifyToken, adminNeeded], update);

  app.post('/vows/delete', [verifyToken, adminNeeded], deleteVow);
};
