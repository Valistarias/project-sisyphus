import type { Router } from 'express';

import { verifyToken, adminNeeded } from '../../middlewares';

import {
  create,
  update,
  deleteChapter,
  findAll,
  findSingle,
  findAllByRuleBook,
  changePagesOrder
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/chapters/', [verifyToken, adminNeeded], findAll);

  app.get('/chaptersbyrulebookid/', [verifyToken], findAllByRuleBook);

  app.get('/chapters/single', [verifyToken], findSingle);

  app.post('/chapters/create', [verifyToken, adminNeeded], create);

  app.post('/chapters/update', [verifyToken, adminNeeded], update);

  app.post('/chapters/changepagesorder', [verifyToken, adminNeeded], changePagesOrder);

  app.post('/chapters/delete', [verifyToken, adminNeeded], deleteChapter);
};
