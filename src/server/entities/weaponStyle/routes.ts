import type { Router } from 'express';

import {
  adminNeeded, verifyToken
} from '../../middlewares';

import {
  create, deleteWeaponStyle, findAll, findSingle, update
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/weaponstyles/', [verifyToken], findAll);

  app.get('/weaponstyles/single', [verifyToken], findSingle);

  app.post('/weaponstyles/create', [verifyToken, adminNeeded], create);

  app.post('/weaponstyles/update', [verifyToken, adminNeeded], update);

  app.post(
    '/weaponstyles/delete',
    [verifyToken, adminNeeded],
    deleteWeaponStyle
  );
};
