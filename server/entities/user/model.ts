import { model, type Model, Schema, type HydratedDocument, type ObjectId } from 'mongoose';
import { type IRole } from '../index';

interface IUser {
  /** The mail of the user */
  mail: string;
  /** The user password (encrypted) */
  password: string;
  /** The name of the user */
  name: string;
  /** The chosen language for the UI */
  lang: string;
  /** The chosen theme for the UI */
  theme: string;
  /** The scale of the UI */
  scale: number;
  /** Is the user verified */
  verified: boolean;
  /** The user roles */
  roles: string[] | ObjectId[];
  /** When the user was created */
  createdAt: Date;
}

interface HydratedIUser extends Omit<HydratedDocument<IUser>, 'roles'> {
  roles: IRole[];
}

const userSchema = new Schema<IUser>({
  mail: String,
  password: String,
  name: String,
  lang: String,
  theme: String,
  scale: Number,
  verified: {
    type: Boolean,
    default: false,
  },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = (): Model<IUser> => model('User', userSchema);

export { type IUser, type HydratedIUser, UserModel };
