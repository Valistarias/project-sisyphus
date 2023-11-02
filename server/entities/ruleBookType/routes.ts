import { type Router } from 'express';

import { verifyToken, adminNeeded } from '../../middlewares';

import { create, update, deleteRuleBookType, findAll, findSingle } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/rulebooktypes/', [verifyToken], findAll);

  app.get('/rulebooktypes/single', [verifyToken], findSingle);

  app.post('/rulebooktypes/create', [verifyToken, adminNeeded], create);

  app.post('/rulebooktypes/update', [verifyToken, adminNeeded], update);

  app.post('/rulebooktypes/delete', [verifyToken, adminNeeded], deleteRuleBookType);
};
