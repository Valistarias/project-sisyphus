import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteBody, findAll, findSingle, update, updateStats } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/bodies/', [verifyToken], findAll);

  app.get('/bodies/single', [verifyToken], findSingle);

  app.post('/bodies/create', [verifyToken, adminNeeded], create);

  app.post('/bodies/update', [verifyToken, adminNeeded], update);

  app.post('/bodies/updatestats', [verifyToken, adminNeeded], updateStats);

  app.post('/bodies/delete', [verifyToken, adminNeeded], deleteBody);
};
