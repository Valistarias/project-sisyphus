import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteItem, findAll, findAllStarter, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/items/', [verifyToken], findAll);

  app.get('/items/starter', [verifyToken], findAllStarter);

  app.get('/items/single', [verifyToken], findSingle);

  app.post('/items/create', [verifyToken, adminNeeded], create);

  app.post('/items/update', [verifyToken, adminNeeded], update);

  app.post('/items/delete', [verifyToken, adminNeeded], deleteItem);
};
