import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteAction, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/actions/', [verifyToken], findAll);

  app.get('/actions/single', [verifyToken], findSingle);

  app.post('/actions/create', [verifyToken, adminNeeded], create);

  app.post('/actions/update', [verifyToken, adminNeeded], update);

  app.post('/actions/delete', [verifyToken, adminNeeded], deleteAction);
};
