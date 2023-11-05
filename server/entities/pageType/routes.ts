import { type Router } from 'express';

import { verifyToken, adminNeeded } from '../../middlewares';

import { create, update, deletePageType, findAll, findSingle } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/pagetypes/', [verifyToken], findAll);

  app.get('/pagetypes/single', [verifyToken], findSingle);

  app.post('/pagetypes/create', [verifyToken, adminNeeded], create);

  app.post('/pagetypes/update', [verifyToken, adminNeeded], update);

  app.post('/pagetypes/delete', [verifyToken, adminNeeded], deletePageType);
};
