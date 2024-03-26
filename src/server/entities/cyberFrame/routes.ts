import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteCyberFrame, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/cyberframes/', [verifyToken], findAll);

  app.get('/cyberframes/single', [verifyToken], findSingle);

  app.post('/cyberframes/create', [verifyToken, adminNeeded], create);

  app.post('/cyberframes/update', [verifyToken, adminNeeded], update);

  app.post('/cyberframes/delete', [verifyToken, adminNeeded], deleteCyberFrame);
};
