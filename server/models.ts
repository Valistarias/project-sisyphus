import mongoose from 'mongoose';

import {
  type IRole,
  RoleModel,
  type IUser,
  UserModel,
  type INotion,
  NotionModel,
  type IMailToken,
  MailTokenModel,
  type IRuleBook,
  RuleBookModel,
  type IRuleBookType,
  RuleBookTypeModel,
  type IChapter,
  ChapterModel,
  type IChapterType,
  ChapterTypeModel,
  type IPage,
  PageModel,
  type IPageType,
  PageTypeModel,
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
  /** The Page Types Model */
  PageType: mongoose.Model<IPageType>;
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
  PageType: PageTypeModel(),
};

export default db;
