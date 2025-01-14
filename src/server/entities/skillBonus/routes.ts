import type { Router } from 'express';

import {
  adminNeeded, verifyToken
} from '../../middlewares';

import {
  create, deleteSkillBonus, findAll, findSingle, update
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/skillbonuses/', [verifyToken], findAll);

  app.get('/skillbonuses/single', [verifyToken], findSingle);

  app.post('/skillbonuses/create', [verifyToken, adminNeeded], create);

  app.post('/skillbonuses/update', [verifyToken, adminNeeded], update);

  app.post('/skillbonuses/delete', [verifyToken, adminNeeded], deleteSkillBonus);
};
