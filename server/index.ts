/* eslint-disable no-console */
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import cookieSession from 'cookie-session';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import * as dotenv from 'dotenv';

import DBConfig from './config/db.config';

import AuthRoutes from './entities/auth/routes';
import UserRoutes from './entities/user/routes';

dotenv.config();

export const app = express();
const router = express.Router();

const port = process.env.PORT ?? 3000;
const mailgunApi = process.env.MAILGUN_API_KEY ?? '';
const cookieSecret = process.env.COOKIE_SECRET;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: mailgunApi });

const corsOptions = {
  origin: `http://localhost:${port}`
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
    httpOnly: true
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
AuthRoutes(router, mg);
UserRoutes(router);

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
