import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteNode, findAll, findAllByBranch, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/nodes/', [verifyToken], findAll);

  app.get('/nodes/bybranch', [verifyToken], findAllByBranch);

  app.get('/nodes/single', [verifyToken], findSingle);

  app.post('/nodes/create', [verifyToken, adminNeeded], create);

  app.post('/nodes/update', [verifyToken, adminNeeded], update);

  app.post('/nodes/delete', [verifyToken, adminNeeded], deleteNode);
};
