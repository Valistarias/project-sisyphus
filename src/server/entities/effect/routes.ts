import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteEffect, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/effects/', [verifyToken], findAll);

  app.get('/effects/single', [verifyToken], findSingle);

  app.post('/effects/create', [verifyToken, adminNeeded], create);

  app.post('/effects/update', [verifyToken, adminNeeded], update);

  app.post('/effects/delete', [verifyToken, adminNeeded], deleteEffect);
};
