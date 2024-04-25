import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteImplant, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/implants/', [verifyToken], findAll);

  app.get('/implants/single', [verifyToken], findSingle);

  app.post('/implants/create', [verifyToken, adminNeeded], create);

  app.post('/implants/update', [verifyToken, adminNeeded], update);

  app.post('/implants/delete', [verifyToken, adminNeeded], deleteImplant);
};
