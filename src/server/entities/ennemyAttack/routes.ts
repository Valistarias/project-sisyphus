import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteEnnemyAttack, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/ennemyattacks/', [verifyToken], findAll);

  app.get('/ennemyattacks/single', [verifyToken], findSingle);

  app.post('/ennemyattacks/create', [verifyToken, adminNeeded], create);

  app.post('/ennemyattacks/update', [verifyToken, adminNeeded], update);

  app.post('/ennemyattacks/delete', [verifyToken, adminNeeded], deleteEnnemyAttack);
};
