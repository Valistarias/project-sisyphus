/* eslint-disable no-console */
import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';

import http from 'http';

import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import * as dotenv from 'dotenv';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { Server } from 'socket.io';
import ViteExpress from 'vite-express';

import DBConfig from './config/db.config';
import ActionRoutes from './entities/action/routes';
import ActionDurationRoutes from './entities/actionDuration/routes';
import ActionTypeRoutes from './entities/actionType/routes';
import AmmoRoutes from './entities/ammo/routes';
import { verifyTokenSingIn } from './entities/auth/controller';
import AuthRoutes from './entities/auth/routes';
import BagRoutes from './entities/bag/routes';
import BodyPartRoutes from './entities/bodyPart/routes';
import CampaignRoutes from './entities/campaign/routes';
import ChapterRoutes from './entities/chapter/routes';
import ChapterTypeRoutes from './entities/chapterType/routes';
import CharacterRoutes from './entities/character/routes';
import CharParamRoutes from './entities/charParam/routes';
import CharParamBonusRoutes from './entities/charParamBonus/routes';
import CyberFrameRoutes from './entities/cyberFrame/routes';
import CyberFrameBranchRoutes from './entities/cyberFrameBranch/routes';
import DamageRoutes from './entities/damage/routes';
import DamageTypeRoutes from './entities/damageType/routes';
import EffectRoutes from './entities/effect/routes';
import EnnemyAttackRoutes from './entities/ennemyAttack/routes';
import ImplantRoutes from './entities/implant/routes';
import ItemModifierRoutes from './entities/itemModifier/routes';
import ItemTypeRoutes from './entities/itemType/routes';
import { verifyMailToken } from './entities/mailToken/controller';
import MailTokenRoutes from './entities/mailToken/routes';
import NodeRoutes from './entities/node/routes';
import NotionRoutes from './entities/notion/routes';
import NPCRoutes from './entities/npc/routes';
import PageRoutes from './entities/page/routes';
import ProgramRoutes from './entities/program/routes';
import ProgramScopeRoutes from './entities/programScope/routes';
import RarityRoutes from './entities/rarity/routes';
import RollRoutes from './entities/roll/routes';
import RuleBookRoutes from './entities/ruleBook/routes';
import RuleBookTypeRoutes from './entities/ruleBookType/routes';
import SkillRoutes from './entities/skill/routes';
import SkillBonusRoutes from './entities/skillBonus/routes';
import SkillBranchRoutes from './entities/skillBranch/routes';
import StatRoutes from './entities/stat/routes';
import StatBonusRoutes from './entities/statBonus/routes';
import UserRoutes from './entities/user/routes';
import WeaponRoutes from './entities/weapon/routes';
import WeaponScopeRoutes from './entities/weaponScope/routes';
import WeaponStyleRoutes from './entities/weaponStyle/routes';
import WeaponTypeRoutes from './entities/weaponType/routes';
import { checkRouteRights } from './middlewares/authJwt';
import { gemInvalidField } from './utils/globalErrorMessage';

// Initialization -------------------------------------------------------------------
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Env vars
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
// ----------------------------------------------------------------------------------------

// Database Connection ---------------------------------------------------------------------
mongoose
  .connect(DBConfig.url(process.env))
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });

const apiRouter = express.Router();

// Global routes
AuthRoutes(apiRouter, mg);
MailTokenRoutes(apiRouter, mg);
UserRoutes(apiRouter);

// Rulebook routes
ChapterRoutes(apiRouter);
ChapterTypeRoutes(apiRouter);
NotionRoutes(apiRouter);
PageRoutes(apiRouter);
RuleBookRoutes(apiRouter);
RuleBookTypeRoutes(apiRouter);

// Campaign routes
CampaignRoutes(apiRouter);
RollRoutes(apiRouter);

// Character routes
CharacterRoutes(apiRouter);
BodyPartRoutes(apiRouter);

// Rules routes
ActionDurationRoutes(apiRouter);
ActionRoutes(apiRouter);
ActionTypeRoutes(apiRouter);
CharParamBonusRoutes(apiRouter);
CharParamRoutes(apiRouter);
CyberFrameBranchRoutes(apiRouter);
CyberFrameRoutes(apiRouter);
EffectRoutes(apiRouter);
NodeRoutes(apiRouter);
SkillBonusRoutes(apiRouter);
SkillBranchRoutes(apiRouter);
SkillRoutes(apiRouter);
StatBonusRoutes(apiRouter);
StatRoutes(apiRouter);

// Items routes
AmmoRoutes(apiRouter);
BagRoutes(apiRouter);
DamageRoutes(apiRouter);
DamageTypeRoutes(apiRouter);
ItemModifierRoutes(apiRouter);
ItemTypeRoutes(apiRouter);
ProgramRoutes(apiRouter);
ProgramScopeRoutes(apiRouter);
RarityRoutes(apiRouter);
WeaponRoutes(apiRouter);
WeaponScopeRoutes(apiRouter);
WeaponStyleRoutes(apiRouter);
WeaponTypeRoutes(apiRouter);
ImplantRoutes(apiRouter);

// NPC routes
EnnemyAttackRoutes(apiRouter);
NPCRoutes(apiRouter);

// Global Router
app.use('/api/', apiRouter);
// ----------------------------------------------------------------------------------------

// Automatic redirections ---------------------------------------------------------------------
// (Neet to be elsewhere)
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
// ----------------------------------------------------------------------------------------

// Checking user rights to open specific routes -------------------------------------------
app.get('/*', (req: Request, res: Response, next: () => void) => {
  checkRouteRights(req, res, next);
});
// ----------------------------------------------------------------------------------------

// Socket IO for Campaigns ----------------------------------------------------------------
io.on('connection', (socket) => {
  socket.on('goToRoom', (data: string) => {
    void socket.join(data);
  });

  socket.on('exitRoom', (data: string) => {
    void socket.leave(data);
  });

  socket.on('newRoll', ({ room, data }: { room: string; data: Record<string, any> }) => {
    socket.to(room).emit('newRoll', data);
  });
});

// ----------------------------------------------------------------------------------------

const server = httpServer.listen(3000, '0.0.0.0', () => {
  console.log('Server is listening...');
});

ViteExpress.bind(app, server).then(
  () => {},
  () => {}
);
// ----------------------------------------------------------------------------------------
