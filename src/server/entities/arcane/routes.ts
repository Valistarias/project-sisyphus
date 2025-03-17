import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteArcane, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/arcanes/', [verifyToken], findAll);

  app.get('/arcanes/single', [verifyToken], findSingle);

  app.post('/arcanes/create', [verifyToken, adminNeeded], create);

  app.post('/arcanes/update', [verifyToken, adminNeeded], update);

  app.post('/arcanes/delete', [verifyToken, adminNeeded], deleteArcane);
};
