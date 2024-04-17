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
  ItemModifiers,
  MailToken,
  Nodes,
  Notions,
  Pages,
  Rarities,
  Rolls,
  RuleBookTypes,
  RuleBooks,
  SkillBonuses,
  SkillBranches,
  Skills,
  StatBonuses,
  Stats,
  Users,
  WeaponScopes,
  WeaponStyles,
  WeaponTypes,
} from './entities/index';

export default class Api {
  actionDurations: ActionDurations;
  actions: Actions;
  actionTypes: ActionTypes;
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
  itemModifiers: ItemModifiers;
  mailToken: MailToken;
  nodes: Nodes;
  notions: Notions;
  pages: Pages;
  rarities: Rarities;
  rolls: Rolls;
  ruleBooks: RuleBooks;
  ruleBookTypes: RuleBookTypes;
  skillBonuses: SkillBonuses;
  skillBranches: SkillBranches;
  skills: Skills;
  statBonuses: StatBonuses;
  stats: Stats;
  users: Users;
  weaponScopes: WeaponScopes;
  weaponStyles: WeaponStyles;
  weaponTypes: WeaponTypes;

  constructor() {
    this.actionDurations = new ActionDurations();
    this.actions = new Actions();
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
    this.itemModifiers = new ItemModifiers();
    this.mailToken = new MailToken();
    this.nodes = new Nodes();
    this.notions = new Notions();
    this.pages = new Pages();
    this.rarities = new Rarities();
    this.rolls = new Rolls();
    this.ruleBooks = new RuleBooks();
    this.ruleBookTypes = new RuleBookTypes();
    this.skillBonuses = new SkillBonuses();
    this.skillBranches = new SkillBranches();
    this.skills = new Skills();
    this.statBonuses = new StatBonuses();
    this.stats = new Stats();
    this.users = new Users();
    this.weaponScopes = new WeaponScopes();
    this.weaponStyles = new WeaponStyles();
    this.weaponTypes = new WeaponTypes();
  }
}
