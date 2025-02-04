import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteGlobalValue, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/globalvalues/', [verifyToken], findAll);

  app.get('/globalvalues/single', [verifyToken], findSingle);

  app.post('/globalvalues/create', [verifyToken, adminNeeded], create);

  app.post('/globalvalues/update', [verifyToken, adminNeeded], update);

  app.post('/globalvalues/delete', [verifyToken, adminNeeded], deleteGlobalValue);
};
