import {
  Auth,
  Campaigns,
  ChapterTypes,
  Chapters,
  MailToken,
  Notions,
  Pages,
  RuleBookTypes,
  RuleBooks,
  Users,
} from './entities/index';

export default class Api {
  auth: Auth;
  mailToken: MailToken;
  notions: Notions;
  ruleBooks: RuleBooks;
  ruleBookTypes: RuleBookTypes;
  chapters: Chapters;
  chapterTypes: ChapterTypes;
  pages: Pages;
  users: Users;
  campaigns: Campaigns;

  constructor() {
    this.auth = new Auth();
    this.mailToken = new MailToken();
    this.notions = new Notions();
    this.users = new Users();
    this.ruleBooks = new RuleBooks();
    this.ruleBookTypes = new RuleBookTypes();
    this.chapters = new Chapters();
    this.chapterTypes = new ChapterTypes();
    this.pages = new Pages();
    this.campaigns = new Campaigns();
  }
}
