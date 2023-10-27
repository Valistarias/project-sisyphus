import { type Router } from 'express';

import { verifyToken, adminNeeded } from '../../middlewares';

import {
  create,
  update,
  deleteRuleBook,
  findAll,
  findSingle
} from './controller';

export default (app: Router): void => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept'
    );
    next();
  });

  app.get('/api/rulebooks/',
    [
      verifyToken
    ], findAll);

  app.get(
    '/api/rulebooks/single',
    [
      verifyToken
    ],
    findSingle
  );

  app.post(
    '/api/rulebooks/create',
    [
      verifyToken,
      adminNeeded
    ],
    create
  );

  app.post(
    '/api/rulebooks/update',
    [
      verifyToken,
      adminNeeded
    ],
    update
  );

  app.post(
    '/api/rulebooks/delete',
    [
      verifyToken,
      adminNeeded
    ],
    deleteRuleBook
  );
};
