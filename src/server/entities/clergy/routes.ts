import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteClergy, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/clergies/', [verifyToken], findAll);

  app.get('/clergies/single', [verifyToken], findSingle);

  app.post('/clergies/create', [verifyToken, adminNeeded], create);

  app.post('/clergies/update', [verifyToken, adminNeeded], update);

  app.post('/clergies/delete', [verifyToken, adminNeeded], deleteClergy);
};
