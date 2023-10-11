import {
  Users,
  Auth
} from './entities/index';

export default class Api {
  users: Users;
  auth: Auth;

  constructor () {
    this.users = new Users();
    this.auth = new Auth();
  }
}
