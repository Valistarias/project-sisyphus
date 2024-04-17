import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import {
  changeRaritiesOrder,
  create,
  deleteRarity,
  findAll,
  findSingle,
  update,
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/rarities/', [verifyToken], findAll);

  app.get('/rarities/single', [verifyToken], findSingle);

  app.post('/rarities/create', [verifyToken, adminNeeded], create);

  app.post('/rarities/update', [verifyToken, adminNeeded], update);

  app.post('/rarities/changeraritiesorder', [verifyToken, adminNeeded], changeRaritiesOrder);

  app.post('/rarities/delete', [verifyToken, adminNeeded], deleteRarity);
};
