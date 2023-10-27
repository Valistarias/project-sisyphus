import { type Router } from 'express';

import { verifyToken, adminNeeded } from '../../middlewares';

import {
  create,
  update,
  deleteNotion,
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

  app.get('/api/notions/',
    [
      verifyToken,
      adminNeeded
    ], findAll);

  app.get(
    '/api/notions/single',
    [
      verifyToken
    ],
    findSingle
  );

  app.post(
    '/api/notions/create',
    [
      verifyToken,
      adminNeeded
    ],
    create
  );

  app.post(
    '/api/notions/update',
    [
      verifyToken,
      adminNeeded
    ],
    update
  );

  app.post(
    '/api/notions/delete',
    [
      verifyToken,
      adminNeeded
    ],
    deleteNotion
  );
};
