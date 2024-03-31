import { type Router } from 'express';

import { adminNeeded, verifyToken } from '../../middlewares';

import {
  create,
  deleteSkillBranch,
  findAll,
  findAllBySkill,
  findSingle,
  update,
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/skillbranches/', [verifyToken], findAll);

  app.get('/skillbranches/byskill', [verifyToken], findAllBySkill);

  app.get('/skillbranches/single', [verifyToken], findSingle);

  app.post('/skillbranches/create', [verifyToken, adminNeeded], create);

  app.post('/skillbranches/update', [verifyToken, adminNeeded], update);

  app.post('/skillbranches/delete', [verifyToken, adminNeeded], deleteSkillBranch);
};
