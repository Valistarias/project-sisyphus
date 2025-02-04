import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteWeaponScope, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/weaponscopes/', [verifyToken], findAll);

  app.get('/weaponscopes/single', [verifyToken], findSingle);

  app.post('/weaponscopes/create', [verifyToken, adminNeeded], create);

  app.post('/weaponscopes/update', [verifyToken, adminNeeded], update);

  app.post('/weaponscopes/delete', [verifyToken, adminNeeded], deleteWeaponScope);
};
