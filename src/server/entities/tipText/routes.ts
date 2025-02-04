import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteTipText, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/tiptexts/', [verifyToken], findAll);

  app.get('/tiptexts/single', [verifyToken], findSingle);

  app.post('/tiptexts/create', [verifyToken, adminNeeded], create);

  app.post('/tiptexts/update', [verifyToken, adminNeeded], update);

  app.post('/tiptexts/delete', [verifyToken, adminNeeded], deleteTipText);
};
