import { type Router } from 'express';

import { verifyToken } from '../../middlewares';

import { create, findAllByCampaign, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/rolls/bycampaign/', [verifyToken], findAllByCampaign);

  app.post('/rolls/create', [verifyToken], create);

  app.post('/rolls/update', [verifyToken], update);
};
