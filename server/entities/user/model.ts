import { model, type Model, Schema, type HydratedDocument, type ObjectId } from 'mongoose';
import { type IRole } from '../index';

interface IUser {
  /** The username of the user */
  username: string
  /** The username password (encrypted) */
  password: string
  /** The name of the user */
  name: string
  /** The chosen language for the UI */
  lang: string
  /** The chosen theme for the UI */
  theme: string
  /** The scale of the UI */
  scale: number
  /** The user roles */
  roles: string[] | ObjectId[]
}

interface HydratedIUser extends Omit<HydratedDocument<IUser>, 'roles'> {
  roles: IRole[]
}

const userSchema = new Schema<IUser>({
  username: String,
  password: String,
  name: String,
  lang: String,
  theme: String,
  scale: Number,
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Role'
    }
  ]
});

const UserModel = (): Model<IUser> => model('User', userSchema);

export { type IUser, type HydratedIUser, UserModel };
