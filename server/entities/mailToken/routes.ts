import { type Request, type Response, type Router } from 'express';

import { type IMailgunClient } from 'mailgun.js/Interfaces';

import {
  createToken,
  getUserMailByRequest
} from './controller';

export default (app: Router, mg: IMailgunClient): void => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept'
    );
    next();
  });

  app.post('/forgot/create', (req: Request, res: Response) => {
    createToken(req, res, mg);
  });

  app.get('/forgot/getmail', getUserMailByRequest);
};
