import {
  Auth,
  MailToken,
  Notion,
  Users
} from './entities/index';

export default class Api {
  auth: Auth;
  mailToken: MailToken;
  notion: Notion;
  users: Users;

  constructor () {
    this.auth = new Auth();
    this.mailToken = new MailToken();
    this.notion = new Notion();
    this.users = new Users();
  }
}
