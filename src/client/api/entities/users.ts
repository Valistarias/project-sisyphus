import Entity from './entity';

import type { IUser } from '../../types';

// interface IUpdateUserPayload {
//   username: string;
//   password: string;
//   name: string;
//   lang: string;
//   theme: string;
//   scale: number;
// }

export default class Users extends Entity<IUser> {
  constructor() {
    super('users');
  }
}
