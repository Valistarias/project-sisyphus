import type { Router } from 'express';

import {
  verifyToken, adminNeeded
} from '../../middlewares';

import {
  create, update, deleteChapterType, findAll, findSingle
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/chaptertypes/', [verifyToken], findAll);

  app.get('/chaptertypes/single', [verifyToken], findSingle);

  app.post('/chaptertypes/create', [verifyToken, adminNeeded], create);

  app.post('/chaptertypes/update', [verifyToken, adminNeeded], update);

  app.post('/chaptertypes/delete', [verifyToken, adminNeeded], deleteChapterType);
};
