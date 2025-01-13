import type { Router } from 'express';

import { verifyToken, adminNeeded } from '../../middlewares';

import { create, update, deletePage, findAll, findSingle, findAllByChapter } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/pages/', [verifyToken], findAll);

  app.get('/pagesbychapterid/', [verifyToken], findAllByChapter);

  app.get('/pages/single', [verifyToken], findSingle);

  app.post('/pages/create', [verifyToken, adminNeeded], create);

  app.post('/pages/update', [verifyToken, adminNeeded], update);

  app.post('/pages/delete', [verifyToken, adminNeeded], deletePage);
};
