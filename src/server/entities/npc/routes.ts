import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteNPC, findAll, findAllBasic, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/npcs/', [verifyToken], findAll);

  app.get('/npcs/basic', [verifyToken], findAllBasic);

  app.get('/npcs/single', [verifyToken], findSingle);

  app.post('/npcs/create', [verifyToken, adminNeeded], create);

  app.post('/npcs/update', [verifyToken, adminNeeded], update);

  app.post('/npcs/delete', [verifyToken, adminNeeded], deleteNPC);
};
