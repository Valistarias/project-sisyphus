import {
  Auth,
  MailToken,
  Notions,
  Users,
  RuleBooks,
  RuleBookTypes,
  Chapters,
  ChapterTypes,
  Pages,
  PageTypes,
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
  pageTypes: PageTypes;
  users: Users;

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
    this.pageTypes = new PageTypes();
  }
}
