import type { Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import {
  create,
  deleteCyberFrameBranch,
  findAll,
  findAllByFrame,
  findSingle,
  update,
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/cyberframebranches/', [verifyToken], findAll);

  app.get('/cyberframebranches/byframe', [verifyToken], findAllByFrame);

  app.get('/cyberframebranches/single', [verifyToken], findSingle);

  app.post('/cyberframebranches/create', [verifyToken, adminNeeded], create);

  app.post('/cyberframebranches/update', [verifyToken, adminNeeded], update);

  app.post('/cyberframebranches/delete', [verifyToken, adminNeeded], deleteCyberFrameBranch);
};
