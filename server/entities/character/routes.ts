import { type Router } from 'express';

import { verifyToken } from '../../middlewares';

import {
  create,
  deleteCharacter,
  findAll,
  findSingle,
  joinCampaign,
  quitCampaign,
  updateInfos,
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/characters/', [verifyToken], findAll);

  app.get('/characters/single', [verifyToken], findSingle);

  app.post('/characters/joincampaign', [verifyToken], joinCampaign);

  app.post('/characters/quitcampaign', [verifyToken], quitCampaign);

  app.post('/characters/create', [verifyToken], create);

  app.post('/characters/update', [verifyToken], updateInfos);

  app.post('/characters/delete', [verifyToken], deleteCharacter);
};
