import type { Router } from 'express';

import {
  adminNeeded, verifyToken
} from '../../middlewares';

import {
  create, deleteArmorType, findAll, findSingle, update
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/armortypes/', [verifyToken], findAll);

  app.get('/armortypes/single', [verifyToken], findSingle);

  app.post('/armortypes/create', [verifyToken, adminNeeded], create);

  app.post('/armortypes/update', [verifyToken, adminNeeded], update);

  app.post('/armortypes/delete', [verifyToken, adminNeeded], deleteArmorType);
};
