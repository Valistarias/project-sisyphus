import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteProgram, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/programs/', [verifyToken], findAll);

  app.get('/programs/single', [verifyToken], findSingle);

  app.post('/programs/create', [verifyToken, adminNeeded], create);

  app.post('/programs/update', [verifyToken, adminNeeded], update);

  app.post('/programs/delete', [verifyToken, adminNeeded], deleteProgram);
};
