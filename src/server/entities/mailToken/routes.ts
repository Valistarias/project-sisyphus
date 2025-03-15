import type { Request, Response, Router } from 'express';

import { createToken, getUserMailByRequest } from './controller';

import type { Interfaces } from 'mailgun.js/definitions';

export default (app: Router, mg: Interfaces.IMailgunClient): void => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.post('/forgot/create', (req: Request, res: Response) => {
    createToken(req, res, mg);
  });

  app.get('/forgot/getmail', getUserMailByRequest);
};
