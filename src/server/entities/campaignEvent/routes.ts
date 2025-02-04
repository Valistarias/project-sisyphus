import type { Router } from 'express';

import { verifyToken } from '../../middlewares';

import { create, findAllByCampaign, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/campaignevents/bycampaign/', [verifyToken], findAllByCampaign);

  app.post('/campaignevents/create', [verifyToken], create);

  app.post('/campaignevents/update', [verifyToken], update);
};
