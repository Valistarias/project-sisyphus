import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteCharParam, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/charparams/', [verifyToken], findAll);

  app.get('/charparams/single', [verifyToken], findSingle);

  app.post('/charparams/create', [verifyToken, adminNeeded], create);

  app.post('/charparams/update', [verifyToken, adminNeeded], update);

  app.post('/charparams/delete', [verifyToken, adminNeeded], deleteCharParam);
};
