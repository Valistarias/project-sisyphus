import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteDamageType, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/damagetypes/', [verifyToken], findAll);

  app.get('/damagetypes/single', [verifyToken], findSingle);

  app.post('/damagetypes/create', [verifyToken, adminNeeded], create);

  app.post('/damagetypes/update', [verifyToken, adminNeeded], update);

  app.post('/damagetypes/delete', [verifyToken, adminNeeded], deleteDamageType);
};
