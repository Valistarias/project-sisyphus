import type { Router } from 'express';

import {
  adminNeeded, verifyToken
} from '../../middlewares';

import {
  create, deleteItemModifier, findAll, findSingle, update
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/itemmodifiers/', [verifyToken], findAll);

  app.get('/itemmodifiers/single', [verifyToken], findSingle);

  app.post('/itemmodifiers/create', [verifyToken, adminNeeded], create);

  app.post('/itemmodifiers/update', [verifyToken, adminNeeded], update);

  app.post('/itemmodifiers/delete', [verifyToken, adminNeeded], deleteItemModifier);
};
