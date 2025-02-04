import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteCharParamBonus, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/charparambonuses/', [verifyToken], findAll);

  app.get('/charparambonuses/single', [verifyToken], findSingle);

  app.post('/charparambonuses/create', [verifyToken, adminNeeded], create);

  app.post('/charparambonuses/update', [verifyToken, adminNeeded], update);

  app.post('/charparambonuses/delete', [verifyToken, adminNeeded], deleteCharParamBonus);
};
