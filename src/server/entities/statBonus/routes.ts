import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteStatBonus, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/statbonuses/', [verifyToken], findAll);

  app.get('/statbonuses/single', [verifyToken], findSingle);

  app.post('/statbonuses/create', [verifyToken, adminNeeded], create);

  app.post('/statbonuses/update', [verifyToken, adminNeeded], update);

  app.post('/statbonuses/delete', [verifyToken, adminNeeded], deleteStatBonus);
};
