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

  app.get('/notions/',
    [
      verifyToken,
      adminNeeded
    ], findAll);

  app.get(
    '/notions/single',
    [
      verifyToken
    ],
    findSingle
  );

  app.post(
    '/notions/create',
    [
      verifyToken,
      adminNeeded
    ],
    create
  );

  app.post(
    '/notions/update',
    [
      verifyToken,
      adminNeeded
    ],
    update
  );

  app.post(
    '/notions/delete',
    [
      verifyToken,
      adminNeeded
    ],
    deleteNotion
  );
};
