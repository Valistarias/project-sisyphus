import { type Router } from 'express';

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
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/campaigns/', [verifyToken], findAll);

  app.get('/campaigns/single', [verifyToken], findSingle);

  app.get('/campaigns/find', [verifyToken], findByCode);

  app.get('/campaigns/generatecode', [verifyToken], generateCode);

  app.get('/campaigns/register', [verifyToken], register);

  app.get('/campaigns/unregister', [verifyToken], unregister);

  app.post('/campaigns/create', [verifyToken], create);

  app.post('/campaigns/update', [verifyToken], update);

  app.post('/campaigns/delete', [verifyToken], deleteCampaign);
};
