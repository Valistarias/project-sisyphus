import { type Router } from 'express';

import { verifyToken, adminNeeded } from '../../middlewares';

import { create, update, deleteRuleBook, findAll, findSingle } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/rulebooks/', [verifyToken], findAll);

  app.get('/rulebooks/single', [verifyToken], findSingle);

  app.post('/rulebooks/create', [verifyToken, adminNeeded], create);

  app.post('/rulebooks/update', [verifyToken, adminNeeded], update);

  app.post('/rulebooks/delete', [verifyToken, adminNeeded], deleteRuleBook);
};
