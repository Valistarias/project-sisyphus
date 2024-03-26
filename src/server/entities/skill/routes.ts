import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteSkill, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/skills/', [verifyToken], findAll);

  app.get('/skills/single', [verifyToken], findSingle);

  app.post('/skills/create', [verifyToken, adminNeeded], create);

  app.post('/skills/update', [verifyToken, adminNeeded], update);

  app.post('/skills/delete', [verifyToken, adminNeeded], deleteSkill);
};
