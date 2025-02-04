import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteActionType, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/actiontypes/', [verifyToken], findAll);

  app.get('/actiontypes/single', [verifyToken], findSingle);

  app.post('/actiontypes/create', [verifyToken, adminNeeded], create);

  app.post('/actiontypes/update', [verifyToken, adminNeeded], update);

  app.post('/actiontypes/delete', [verifyToken, adminNeeded], deleteActionType);
};
