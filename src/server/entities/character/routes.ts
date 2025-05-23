import type { Router } from 'express';

import { verifyToken } from '../../middlewares';

import {
  addNode,
  deleteCharacter,
  findAll,
  findSingle,
  quitCampaign,
  updateInfos,
  updateNodes,
  updateStats,
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/characters/', [verifyToken], findAll);

  app.get('/characters/single', [verifyToken], findSingle);

  app.post('/characters/quitcampaign', [verifyToken], quitCampaign);

  app.post('/characters/addnode', [verifyToken], addNode);

  app.post('/characters/updatenodes', [verifyToken], updateNodes);

  app.post('/characters/update', [verifyToken], updateInfos);

  app.post('/characters/updatestats', [verifyToken], updateStats);

  app.post('/characters/delete', [verifyToken], deleteCharacter);
};
