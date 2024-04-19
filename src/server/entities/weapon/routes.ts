import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteWeapon, findAll, findAllByBranch, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/weapons/', [verifyToken], findAll);

  app.get('/weapons/bybranch', [verifyToken], findAllByBranch);

  app.get('/weapons/single', [verifyToken], findSingle);

  app.post('/weapons/create', [verifyToken, adminNeeded], create);

  app.post('/weapons/update', [verifyToken, adminNeeded], update);

  app.post('/weapons/delete', [verifyToken, adminNeeded], deleteWeapon);
};
