import type { Router } from 'express';

import {
  verifyToken, adminNeeded
} from '../../middlewares';

import {
  create, update, deleteNotion, findAllByRuleBook, findSingle
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/notions/byrulebook/', [verifyToken], findAllByRuleBook);

  app.get('/notions/single', [verifyToken], findSingle);

  app.post('/notions/create', [verifyToken, adminNeeded], create);

  app.post('/notions/update', [verifyToken, adminNeeded], update);

  app.post('/notions/delete', [verifyToken, adminNeeded], deleteNotion);
};
