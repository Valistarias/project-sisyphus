import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteProgramScope, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/programscopes/', [verifyToken], findAll);

  app.get('/programscopes/single', [verifyToken], findSingle);

  app.post('/programscopes/create', [verifyToken, adminNeeded], create);

  app.post('/programscopes/update', [verifyToken, adminNeeded], update);

  app.post('/programscopes/delete', [verifyToken, adminNeeded], deleteProgramScope);
};
