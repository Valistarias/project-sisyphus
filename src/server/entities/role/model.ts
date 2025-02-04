import { model, type Model, Schema } from 'mongoose';

interface IRole {
  name: string;
}

const RoleSchema = new Schema<IRole>({ name: String });

const RoleModel = (): Model<IRole> => model('Role', RoleSchema);

export { type IRole, RoleModel };
