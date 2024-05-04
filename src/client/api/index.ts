import {
  ActionDurations,
  ActionTypes,
  Actions,
  Ammos,
  ArmorTypes,
  Armors,
  Auth,
  Bags,
  BodyParts,
  Campaigns,
  ChapterTypes,
  Chapters,
  CharParamBonuses,
  CharParams,
  Characters,
  CyberFrameBranches,
  CyberFrames,
  DamageTypes,
  Damages,
  Effects,
  EnnemyAttacks,
  Implants,
  ItemModifiers,
  ItemTypes,
  Items,
  MailToken,
  NPCs,
  Nodes,
  Notions,
  Pages,
  ProgramScopes,
  Programs,
  Rarities,
  Rolls,
  RuleBookTypes,
  RuleBooks,
  SkillBonuses,
  SkillBranches,
  Skills,
  StatBonuses,
  Stats,
  TipTexts,
  Users,
  WeaponScopes,
  WeaponStyles,
  WeaponTypes,
  Weapons,
} from './entities/index';

export default class Api {
  actionDurations: ActionDurations;
  actions: Actions;
  actionTypes: ActionTypes;
  ammos: Ammos;
  armors: Armors;
  auth: Auth;
  bags: Bags;
  bodyParts: BodyParts;
  campaigns: Campaigns;
  chapters: Chapters;
  chapterTypes: ChapterTypes;
  characters: Characters;
  charParamBonuses: CharParamBonuses;
  charParams: CharParams;
  cyberFrameBranches: CyberFrameBranches;
  cyberFrames: CyberFrames;
  damages: Damages;
  damageTypes: DamageTypes;
  effects: Effects;
  ennemyAttacks: EnnemyAttacks;
  implants: Implants;
  itemModifiers: ItemModifiers;
  items: Items;
  itemTypes: ItemTypes;
  mailToken: MailToken;
  nodes: Nodes;
  notions: Notions;
  nPCs: NPCs;
  pages: Pages;
  programs: Programs;
  programScopes: ProgramScopes;
  rarities: Rarities;
  rolls: Rolls;
  ruleBooks: RuleBooks;
  ruleBookTypes: RuleBookTypes;
  skillBonuses: SkillBonuses;
  skillBranches: SkillBranches;
  skills: Skills;
  statBonuses: StatBonuses;
  stats: Stats;
  tipTexts: TipTexts;
  users: Users;
  weapons: Weapons;
  weaponScopes: WeaponScopes;
  weaponStyles: WeaponStyles;
  weaponTypes: WeaponTypes;
  armorTypes: ArmorTypes;

  constructor() {
    this.actionDurations = new ActionDurations();
    this.actions = new Actions();
    this.actionTypes = new ActionTypes();
    this.ammos = new Ammos();
    this.armors = new Armors();
    this.auth = new Auth();
    this.bags = new Bags();
    this.bodyParts = new BodyParts();
    this.campaigns = new Campaigns();
    this.chapters = new Chapters();
    this.chapterTypes = new ChapterTypes();
    this.characters = new Characters();
    this.charParamBonuses = new CharParamBonuses();
    this.charParams = new CharParams();
    this.cyberFrameBranches = new CyberFrameBranches();
    this.cyberFrames = new CyberFrames();
    this.damages = new Damages();
    this.damageTypes = new DamageTypes();
    this.effects = new Effects();
    this.ennemyAttacks = new EnnemyAttacks();
    this.implants = new Implants();
    this.itemModifiers = new ItemModifiers();
    this.items = new Items();
    this.itemTypes = new ItemTypes();
    this.mailToken = new MailToken();
    this.nodes = new Nodes();
    this.notions = new Notions();
    this.nPCs = new NPCs();
    this.pages = new Pages();
    this.programs = new Programs();
    this.programScopes = new ProgramScopes();
    this.rarities = new Rarities();
    this.rolls = new Rolls();
    this.ruleBooks = new RuleBooks();
    this.ruleBookTypes = new RuleBookTypes();
    this.skillBonuses = new SkillBonuses();
    this.skillBranches = new SkillBranches();
    this.skills = new Skills();
    this.statBonuses = new StatBonuses();
    this.stats = new Stats();
    this.tipTexts = new TipTexts();
    this.users = new Users();
    this.weapons = new Weapons();
    this.weaponScopes = new WeaponScopes();
    this.weaponStyles = new WeaponStyles();
    this.weaponTypes = new WeaponTypes();
    this.armorTypes = new ArmorTypes();
  }
}
