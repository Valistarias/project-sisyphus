import mongoose from 'mongoose';

import {
  CampaignModel,
  ChapterModel,
  ChapterTypeModel,
  CharacterModel,
  MailTokenModel,
  NotionModel,
  PageModel,
  RoleModel,
  RuleBookModel,
  RuleBookTypeModel,
  UserModel,
  type ICampaign,
  type IChapter,
  type IChapterType,
  type ICharacter,
  type IMailToken,
  type INotion,
  type IPage,
  type IRole,
  type IRuleBook,
  type IRuleBookType,
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
  /** The Mail Token Model (for forgotten password) */
  MailToken: mongoose.Model<IMailToken>;
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
  // Character models
  Character: CharacterModel(),
};

export default db;
