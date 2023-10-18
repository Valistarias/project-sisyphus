import {
  Users,
  Auth,
  MailToken
} from './entities/index';

export default class Api {
  users: Users;
  auth: Auth;
  mailToken: MailToken;

  constructor () {
    this.users = new Users();
    this.auth = new Auth();
    this.mailToken = new MailToken();
  }
}
