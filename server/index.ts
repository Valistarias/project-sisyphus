/* eslint-disable no-console */
import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';

import path from 'path';

import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import * as dotenv from 'dotenv';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

import DBConfig from './config/db.config';
import { verifyTokenSingIn } from './entities/auth/controller';
import AuthRoutes from './entities/auth/routes';
import CampaignRoutes from './entities/campaign/routes';
import ChapterRoutes from './entities/chapter/routes';
import ChapterTypeRoutes from './entities/chapterType/routes';
import CharacterRoutes from './entities/character/routes';
import { verifyMailToken } from './entities/mailToken/controller';
import MailTokenRoutes from './entities/mailToken/routes';
import NotionRoutes from './entities/notion/routes';
import PageRoutes from './entities/page/routes';
import RuleBookRoutes from './entities/ruleBook/routes';
import RuleBookTypeRoutes from './entities/ruleBookType/routes';
import UserRoutes from './entities/user/routes';
import { checkRouteRights } from './middlewares/authJwt';
import { gemInvalidField } from './utils/globalErrorMessage';

dotenv.config();

export const app = express();
const apiRouter = express.Router();

const port = process.env.PORT ?? 3000;
const mailgunApi = process.env.MAILGUN_API_KEY ?? '';
const cookieSecret = process.env.COOKIE_SECRET;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: mailgunApi });

const corsOptions = {
  origin: `http://localhost:${port}`,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.use(
  cookieSession({
    name: 'sisyphus-charsheet-session',
    secret: cookieSecret, // should use as secret environment variable
    httpOnly: true,
  })
);

mongoose
  .connect(DBConfig.url(process.env))
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });

// Global routes
AuthRoutes(apiRouter, mg);
UserRoutes(apiRouter);
MailTokenRoutes(apiRouter, mg);

// Rulebook routes
NotionRoutes(apiRouter);
RuleBookRoutes(apiRouter);
RuleBookTypeRoutes(apiRouter);
ChapterRoutes(apiRouter);
ChapterTypeRoutes(apiRouter);
PageRoutes(apiRouter);

// Campaign routes
CampaignRoutes(apiRouter);

// Character routes
CharacterRoutes(apiRouter);

// Global Router
app.use('/api/', apiRouter);

app.get('/verify/:id', function (req: Request, res: Response) {
  const { id } = req.params;
  // Check we have an id
  if (id === undefined) {
    return res.status(422).send(gemInvalidField('UserId'));
  }
  verifyTokenSingIn(id)
    .then(() => {
      res.redirect('/login?success=true');
    })
    .catch(() => {
      res.redirect('/');
    });
});

app.get('/*', (req: Request, res: Response, next: () => void) => {
  checkRouteRights(req, res, next);
});

app.get('/reset/password/:userId/:token', function (req: Request, res: Response, next: () => void) {
  const { userId, token } = req.params;
  // Check we have an id and token
  if (userId === undefined || token === undefined) {
    return res.status(422).send(gemInvalidField('Token or UserId'));
  }
  verifyMailToken({ userId, token })
    .then(() => {
      next();
    })
    .catch(() => {
      res.redirect('/');
    });
});

if (process.env.VITE !== 'true') {
  const frontendFiles = __dirname;
  app.use(express.static(frontendFiles));
  app.get('/*', (_, res) => {
    res.sendFile(path.join(frontendFiles, 'index.html'));
  });
  app.listen(port, () => {
    console.log(`running server on from port:${port}`);
  });
}
