import mongoose from 'mongoose';

import {
  type IRole,
  RoleModel,
  type IUser,
  UserModel,
  type IMailToken,
  MailTokenModel
} from './entities';

mongoose.Promise = global.Promise;

interface DBType {
  /** The User Model */
  User: mongoose.Model<IUser>
  /** The Role Model */
  Role: mongoose.Model<IRole>
  /** The Mail Token Model (for forgotten password) */
  MailToken: mongoose.Model<IMailToken>
  /** The possible Roles */
  ROLES: string[]
}

const db: DBType = {
  // User (Agent) models
  User: UserModel(),
  Role: RoleModel(),
  MailToken: MailTokenModel(),
  ROLES: ['user', 'admin']
};

export default db;
