import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteBag, findAll, findAllStarter, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/bags/', [verifyToken], findAll);

  app.get('/bags/starter', [verifyToken], findAllStarter);

  app.get('/bags/single', [verifyToken], findSingle);

  app.post('/bags/create', [verifyToken, adminNeeded], create);

  app.post('/bags/update', [verifyToken, adminNeeded], update);

  app.post('/bags/delete', [verifyToken, adminNeeded], deleteBag);
};
