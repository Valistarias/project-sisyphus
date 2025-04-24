/* eslint-disable no-console -- Consoles are necessary to displays clean messages */

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
import ArcaneRoutes from './entities/arcane/routes';
import ArmorRoutes from './entities/armor/routes';
import ArmorTypeRoutes from './entities/armorType/routes';
import { verifyTokenSingIn } from './entities/auth/controller';
import AuthRoutes from './entities/auth/routes';
import BagRoutes from './entities/bag/routes';
import BodyRoutes from './entities/body/routes';
import BodyPartRoutes from './entities/bodyPart/routes';
import CampaignRoutes from './entities/campaign/routes';
import CampaignEventRoutes from './entities/campaignEvent/routes';
import ChapterRoutes from './entities/chapter/routes';
import ChapterTypeRoutes from './entities/chapterType/routes';
import CharacterRoutes from './entities/character/routes';
import CharParamRoutes from './entities/charParam/routes';
import CharParamBonusRoutes from './entities/charParamBonus/routes';
import CyberFrameRoutes from './entities/cyberFrame/routes';
import DamageRoutes from './entities/damage/routes';
import DamageTypeRoutes from './entities/damageType/routes';
import EffectRoutes from './entities/effect/routes';
import EnnemyAttackRoutes from './entities/ennemyAttack/routes';
import GlobalValueRoutes from './entities/globalValue/routes';
import ImplantRoutes from './entities/implant/routes';
import ItemRoutes from './entities/item/routes';
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
import RuleBookRoutes from './entities/ruleBook/routes';
import RuleBookTypeRoutes from './entities/ruleBookType/routes';
import SkillRoutes from './entities/skill/routes';
import SkillBonusRoutes from './entities/skillBonus/routes';
import StatRoutes from './entities/stat/routes';
import StatBonusRoutes from './entities/statBonus/routes';
import TiptextRoutes from './entities/tipText/routes';
import UserRoutes from './entities/user/routes';
import WeaponRoutes from './entities/weapon/routes';
import WeaponScopeRoutes from './entities/weaponScope/routes';
import WeaponStyleRoutes from './entities/weaponStyle/routes';
import WeaponTypeRoutes from './entities/weaponType/routes';
import { checkRouteRights, type IVerifyTokenRequest } from './middlewares/authJwt';

// Initialization -------------------------------------------------------------------
dotenv.config();

const app = express();
const httpServer = http.createServer(app as (req: unknown, res: unknown) => void);
const io = new Server(httpServer);

// Env vars
const env = (process.env.NODE_ENV ?? 'development').trim();
const port = (process.env.NODE_ENV ?? 'development') === 'development' ? 3000 : 80;
const mailgunApi = process.env.MAILGUN_API_KEY ?? '';
const { COOKIE_SECRET: cookieSecret } = process.env;
const { DB_USER: user, DB_PASS: pass } = process.env;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: mailgunApi,
});

const corsOptions = { origin: `http://localhost:${port}` };

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
const clientOptions: mongoose.ConnectOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

mongoose
  .connect(
    DBConfig.url({
      DB_USER: user ?? '',
      DB_PASS: pass ?? '',
    }),
    clientOptions
  )
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err: unknown) => {
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
CampaignEventRoutes(apiRouter);
ArcaneRoutes(apiRouter);

// Character routes
CharacterRoutes(apiRouter);
BodyRoutes(apiRouter);
BodyPartRoutes(apiRouter);

// Rules routes
ActionDurationRoutes(apiRouter);
ActionRoutes(apiRouter);
ActionTypeRoutes(apiRouter);
CharParamBonusRoutes(apiRouter);
CharParamRoutes(apiRouter);
CyberFrameRoutes(apiRouter);
EffectRoutes(apiRouter);
GlobalValueRoutes(apiRouter);
NodeRoutes(apiRouter);
SkillBonusRoutes(apiRouter);
SkillRoutes(apiRouter);
StatBonusRoutes(apiRouter);
StatRoutes(apiRouter);
TiptextRoutes(apiRouter);

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
ArmorTypeRoutes(apiRouter);
ArmorRoutes(apiRouter);
ItemRoutes(apiRouter);

// NPC routes
EnnemyAttackRoutes(apiRouter);
NPCRoutes(apiRouter);

// Global Router
app.use('/api/', apiRouter);
// ----------------------------------------------------------------------------------------

// Automatic redirections ---------------------------------------------------------------------
// (Need to be elsewhere)
app.get('/verify/:id', (req: Request, res: Response) => {
  const {
    params: { id },
  } = req;
  verifyTokenSingIn(id)
    .then(() => {
      res.redirect('/login?success=true');
    })
    .catch(() => {
      res.redirect('/');
    });
});

app.get('/reset/password/:userId/:token', (req: Request, res: Response, next: () => void) => {
  const {
    params: { userId, token },
  } = req;
  verifyMailToken({
    userId,
    token,
  })
    .then(() => {
      next();
    })
    .catch(() => {
      res.redirect('/');
    });
});
// ----------------------------------------------------------------------------------------

// Checking user rights to open specific routes -------------------------------------------
app.get('/*splat', (req: IVerifyTokenRequest, res: Response, next: () => void) => {
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

  socket.on(
    'newCampaignEvent',
    ({ room, data }: { room: string; data: Record<string, unknown> }) => {
      socket.to(room).emit('newCampaignEvent', data);
    }
  );
});

// ----------------------------------------------------------------------------------------

const server = httpServer.listen(port, '0.0.0.0', () => {
  console.log('Server is listening.......');
});

ViteExpress.config({ mode: env === 'development' || env === 'production' ? env : 'development' });
void ViteExpress.bind(app, server);
// ----------------------------------------------------------------------------------------
