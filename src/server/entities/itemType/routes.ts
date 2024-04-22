import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteItemType, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/itemtypes/', [verifyToken], findAll);

  app.get('/itemtypes/single', [verifyToken], findSingle);

  app.post('/itemtypes/create', [verifyToken, adminNeeded], create);

  app.post('/itemtypes/update', [verifyToken, adminNeeded], update);

  app.post('/itemtypes/delete', [verifyToken, adminNeeded], deleteItemType);
};
