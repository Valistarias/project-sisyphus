import mongoose from 'mongoose';

import {
  type IRole,
  RoleModel,
  type IUser,
  UserModel
} from './entities';

mongoose.Promise = global.Promise;

interface DBType {
  /** The User Model */
  User: mongoose.Model<IUser>
  /** The Role Model */
  Role: mongoose.Model<IRole>
  /** The possible Roles */
  ROLES: string[]
}

const db: DBType = {
  // User (Agent) models
  User: UserModel(),
  Role: RoleModel(),
  ROLES: ['user', 'admin']
};

export default db;
