import {
  Auth,
  Campaigns,
  ChapterTypes,
  Chapters,
  Characters,
  MailToken,
  Notions,
  Pages,
  RuleBookTypes,
  RuleBooks,
  Users,
} from './entities/index';

export default class Api {
  auth: Auth;
  campaigns: Campaigns;
  chapters: Chapters;
  chapterTypes: ChapterTypes;
  characters: Characters;
  mailToken: MailToken;
  notions: Notions;
  pages: Pages;
  ruleBooks: RuleBooks;
  ruleBookTypes: RuleBookTypes;
  users: Users;

  constructor() {
    this.auth = new Auth();
    this.campaigns = new Campaigns();
    this.chapters = new Chapters();
    this.chapterTypes = new ChapterTypes();
    this.characters = new Characters();
    this.mailToken = new MailToken();
    this.notions = new Notions();
    this.pages = new Pages();
    this.ruleBooks = new RuleBooks();
    this.ruleBookTypes = new RuleBookTypes();
    this.users = new Users();
  }
}
