import type { Router } from 'express';

import { verifyToken } from '../../middlewares';

import {
  create,
  deleteBody,
  findAll,
  findSingle,
  resetItems,
  updateSkills,
  update,
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/bodies/', [verifyToken], findAll);

  app.get('/bodies/single', [verifyToken], findSingle);

  app.post('/bodies/create', [verifyToken], create);

  app.post('/bodies/update', [verifyToken], update);

  app.post('/bodies/resetitems', [verifyToken], resetItems);

  app.post('/bodies/updateskills', [verifyToken], updateSkills);

  app.post('/bodies/delete', [verifyToken], deleteBody);
};
