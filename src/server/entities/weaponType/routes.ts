import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteWeaponType, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/weapontypes/', [verifyToken], findAll);

  app.get('/weapontypes/single', [verifyToken], findSingle);

  app.post('/weapontypes/create', [verifyToken, adminNeeded], create);

  app.post('/weapontypes/update', [verifyToken, adminNeeded], update);

  app.post('/weapontypes/delete', [verifyToken, adminNeeded], deleteWeaponType);
};
