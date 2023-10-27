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
  RuleBookTypeModel
} from './entities';

mongoose.Promise = global.Promise;

interface DBType {
  /** The User Model */
  User: mongoose.Model<IUser>
  /** The Role Model */
  Role: mongoose.Model<IRole>
  /** The Notion Model */
  Notion: mongoose.Model<INotion>
  /** The RuleBook Model */
  RuleBook: mongoose.Model<IRuleBook>
  /** The RuleBook Types Model */
  RuleBookType: mongoose.Model<IRuleBookType>
  /** The Mail Token Model (for forgotten password) */
  MailToken: mongoose.Model<IMailToken>
}

const db: DBType = {
  // User (Agent) models
  User: UserModel(),
  Role: RoleModel(),
  MailToken: MailTokenModel(),
  // Rulebook models
  Notion: NotionModel(),
  RuleBook: RuleBookModel(),
  RuleBookType: RuleBookTypeModel()
};

export default db;
