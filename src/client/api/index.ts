import {
  ActionDurations,
  ActionTypes,
  Actions,
  Auth,
  Campaigns,
  ChapterTypes,
  Chapters,
  CharParamBonuses,
  CharParams,
  Characters,
  CyberFrameBranches,
  CyberFrames,
  Effects,
  MailToken,
  Nodes,
  Notions,
  Pages,
  Rolls,
  RuleBookTypes,
  RuleBooks,
  SkillBonuses,
  SkillBranches,
  Skills,
  StatBonuses,
  Stats,
  Users,
} from './entities/index';

export default class Api {
  actions: Actions;
  actionTypes: ActionTypes;
  actionDurations: ActionDurations;
  auth: Auth;
  campaigns: Campaigns;
  chapters: Chapters;
  chapterTypes: ChapterTypes;
  characters: Characters;
  charParamBonuses: CharParamBonuses;
  charParams: CharParams;
  cyberFrameBranches: CyberFrameBranches;
  cyberFrames: CyberFrames;
  effects: Effects;
  mailToken: MailToken;
  nodes: Nodes;
  notions: Notions;
  pages: Pages;
  rolls: Rolls;
  ruleBooks: RuleBooks;
  ruleBookTypes: RuleBookTypes;
  skillBonuses: SkillBonuses;
  skillBranches: SkillBranches;
  skills: Skills;
  statBonuses: StatBonuses;
  stats: Stats;
  users: Users;

  constructor() {
    this.actions = new Actions();
    this.actionDurations = new ActionDurations();
    this.actionTypes = new ActionTypes();
    this.auth = new Auth();
    this.campaigns = new Campaigns();
    this.chapters = new Chapters();
    this.chapterTypes = new ChapterTypes();
    this.characters = new Characters();
    this.charParamBonuses = new CharParamBonuses();
    this.charParams = new CharParams();
    this.cyberFrameBranches = new CyberFrameBranches();
    this.cyberFrames = new CyberFrames();
    this.effects = new Effects();
    this.mailToken = new MailToken();
    this.nodes = new Nodes();
    this.notions = new Notions();
    this.pages = new Pages();
    this.rolls = new Rolls();
    this.ruleBooks = new RuleBooks();
    this.ruleBookTypes = new RuleBookTypes();
    this.skillBonuses = new SkillBonuses();
    this.skillBranches = new SkillBranches();
    this.skills = new Skills();
    this.statBonuses = new StatBonuses();
    this.stats = new Stats();
    this.users = new Users();
  }
}
