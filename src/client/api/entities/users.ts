import Entity from './entity';

// interface IUpdateUserPayload {
//   username: string;
//   password: string;
//   name: string;
//   lang: string;
//   theme: string;
//   scale: number;
// }

export default class Users extends Entity {
  constructor() {
    super('users');
  }
}
