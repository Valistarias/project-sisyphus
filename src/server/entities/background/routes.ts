import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteBackground, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/backgrounds/', [verifyToken], findAll);

  app.get('/backgrounds/single', [verifyToken], findSingle);

  app.post('/backgrounds/create', [verifyToken, adminNeeded], create);

  app.post('/backgrounds/update', [verifyToken, adminNeeded], update);

  app.post('/backgrounds/delete', [verifyToken, adminNeeded], deleteBackground);
};
