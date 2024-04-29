import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import { create, deleteArmor, findAll, findSingle, update } from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/armors/', [verifyToken], findAll);

  app.get('/armors/single', [verifyToken], findSingle);

  app.post('/armors/create', [verifyToken, adminNeeded], create);

  app.post('/armors/update', [verifyToken, adminNeeded], update);

  app.post('/armors/delete', [verifyToken, adminNeeded], deleteArmor);
};
