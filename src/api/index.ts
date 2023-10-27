import {
  Auth,
  MailToken,
  Notions,
  Users,
  RuleBooks,
  RuleBookTypes
} from './entities/index';

export default class Api {
  auth: Auth;
  mailToken: MailToken;
  notions: Notions;
  ruleBooks: RuleBooks;
  ruleBookTypes: RuleBookTypes;
  users: Users;

  constructor () {
    this.auth = new Auth();
    this.mailToken = new MailToken();
    this.notions = new Notions();
    this.users = new Users();
    this.ruleBooks = new RuleBooks();
    this.ruleBookTypes = new RuleBookTypes();
  }
}
