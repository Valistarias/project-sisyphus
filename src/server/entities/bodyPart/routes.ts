import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteBodyPart, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/bodyparts/', [verifyToken], findAll);

  app.get('/bodyparts/single', [verifyToken], findSingle);

  app.post('/bodyparts/create', [verifyToken, adminNeeded], create);

  app.post('/bodyparts/update', [verifyToken, adminNeeded], update);

  app.post('/bodyparts/delete', [verifyToken, adminNeeded], deleteBodyPart);
};
