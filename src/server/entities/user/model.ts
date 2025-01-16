import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { IRole } from '../index';

interface IUser {
  /** The username of the user */
  username: string
  /** The mail of the user */
  mail: string
  /** The user password (encrypted) */
  password: string
  /** The name of the user */
  name: string
  /** The chosen language for the UI */
  lang: string
  /** The chosen theme for the UI */
  theme: string
  /** The scale of the UI */
  scale: number
  /** Is the tips automatically displays in the character creation */
  charCreationTips: boolean
  /** Is the user verified */
  verified: boolean
  /** The user roles */
  roles: ObjectId[]
  /** When the user was created */
  createdAt: Date
}

type HydratedIUser = HydratedDocument<
  Omit<IUser, 'roles'> & { roles: IRole[] }
>;

const userSchema = new Schema<IUser>({
  username: String,
  mail: String,
  password: String,
  name: String,
  lang: String,
  theme: String,
  scale: Number,
  verified: {
    type: Boolean,
    default: false
  },
  charCreationTips: {
    type: Boolean,
    default: true
  },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Role'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserModel = (): Model<IUser> => model('User', userSchema);

export {
  UserModel, type HydratedIUser, type IUser
};
