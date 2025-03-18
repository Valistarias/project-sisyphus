import type { Router } from 'express';

import { verifyToken } from '../../middlewares';

import {
  create,
  deleteCampaign,
  findAll,
  findByCode,
  findSingle,
  generateCode,
  register,
  unregister,
  update,
  shuffleDeck,
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/campaigns/', [verifyToken], findAll);

  app.get('/campaigns/single', [verifyToken], findSingle);

  app.get('/campaigns/find', [verifyToken], findByCode);

  app.post('/campaigns/generatecode', [verifyToken], generateCode);

  app.post('/campaigns/register', [verifyToken], register);

  app.post('/campaigns/unregister', [verifyToken], unregister);

  app.post('/campaigns/create', [verifyToken], create);

  app.post('/campaigns/update', [verifyToken], update);

  app.post('/campaigns/delete', [verifyToken], deleteCampaign);

  app.post('/campaigns/shuffledeck', [verifyToken], shuffleDeck);
};
