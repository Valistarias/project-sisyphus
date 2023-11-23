import { type Router } from 'express';

import { verifyToken } from '../../middlewares';

import { create, deleteCampaign, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/campaign/', [verifyToken], findAll);

  app.get('/campaign/single', [verifyToken], findSingle);

  app.post('/campaign/create', [verifyToken], create);

  app.post('/campaign/update', [verifyToken], update);

  app.post('/campaign/delete', [verifyToken], deleteCampaign);
};
