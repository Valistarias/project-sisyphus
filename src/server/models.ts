import mongoose from 'mongoose';

import {
  ActionModel,
  ActionTypeModel,
  CampaignModel,
  ChapterModel,
  ChapterTypeModel,
  CharacterModel,
  EffectModel,
  MailTokenModel,
  NotionModel,
  PageModel,
  RoleModel,
  RollModel,
  RuleBookModel,
  RuleBookTypeModel,
  SkillModel,
  StatModel,
  UserModel,
  type IAction,
  type IActionType,
  type ICampaign,
  type IChapter,
  type IChapterType,
  type ICharacter,
  type IEffect,
  type IMailToken,
  type INotion,
  type IPage,
  type IRole,
  type IRoll,
  type IRuleBook,
  type IRuleBookType,
  type ISkill,
  type IStat,
  type IUser,
} from './entities';

mongoose.Promise = global.Promise;

interface DBType {
  /** The User Model */
  User: mongoose.Model<IUser>;
  /** The Role Model */
  Role: mongoose.Model<IRole>;
  /** The Notion Model */
  Notion: mongoose.Model<INotion>;
  /** The RuleBook Model */
  RuleBook: mongoose.Model<IRuleBook>;
  /** The RuleBook Types Model */
  RuleBookType: mongoose.Model<IRuleBookType>;
  /** The Chapter Model */
  Chapter: mongoose.Model<IChapter>;
  /** The Chapter Types Model */
  ChapterType: mongoose.Model<IChapterType>;
  /** The Page Model */
  Page: mongoose.Model<IPage>;
  /** The Campaign Model */
  Campaign: mongoose.Model<ICampaign>;
  /** The Character Model */
  Character: mongoose.Model<ICharacter>;
  /** The Roll Model */
  Roll: mongoose.Model<IRoll>;
  /** The Mail Token Model (for forgotten password) */
  MailToken: mongoose.Model<IMailToken>;
  /** The Action Model */
  Action: mongoose.Model<IAction>;
  /** The Action Type Model */
  ActionType: mongoose.Model<IActionType>;
  /** The Effect Model */
  Effect: mongoose.Model<IEffect>;
  /** The Stat Model */
  Stat: mongoose.Model<IStat>;
  /** The Skill Model */
  Skill: mongoose.Model<ISkill>;
  /** The possible Roles */
  ROLES: string[];
}

const db: DBType = {
  // User (Agent) models
  User: UserModel(),
  Role: RoleModel(),
  MailToken: MailTokenModel(),
  ROLES: ['user', 'admin'],
  // Rulebook models
  Notion: NotionModel(),
  RuleBook: RuleBookModel(),
  RuleBookType: RuleBookTypeModel(),
  Chapter: ChapterModel(),
  ChapterType: ChapterTypeModel(),
  Page: PageModel(),
  // Campaign models
  Campaign: CampaignModel(),
  Roll: RollModel(),
  // Character models
  Character: CharacterModel(),
  // Rules models
  Action: ActionModel(),
  ActionType: ActionTypeModel(),
  Effect: EffectModel(),
  Stat: StatModel(),
  Skill: SkillModel(),
};

export default db;
