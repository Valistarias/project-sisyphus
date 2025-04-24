import {
  ActionDurations,
  ActionTypes,
  Actions,
  Ammos,
  ArmorTypes,
  Armors,
  Arcanes,
  Auth,
  Bags,
  Bodies,
  BodyParts,
  CampaignEvents,
  Campaigns,
  ChapterTypes,
  Chapters,
  CharParamBonuses,
  CharParams,
  Characters,
  CyberFrames,
  DamageTypes,
  Damages,
  Effects,
  EnnemyAttacks,
  GlobalValues,
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
  RuleBookTypes,
  RuleBooks,
  SkillBonuses,
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
  armorTypes: ArmorTypes;
  arcanes: Arcanes;
  auth: Auth;
  bags: Bags;
  bodies: Bodies;
  bodyParts: BodyParts;
  campaigns: Campaigns;
  chapters: Chapters;
  chapterTypes: ChapterTypes;
  characters: Characters;
  charParamBonuses: CharParamBonuses;
  charParams: CharParams;
  cyberFrames: CyberFrames;
  damages: Damages;
  damageTypes: DamageTypes;
  effects: Effects;
  ennemyAttacks: EnnemyAttacks;
  globalValues: GlobalValues;
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
  campaignEvents: CampaignEvents;
  ruleBooks: RuleBooks;
  ruleBookTypes: RuleBookTypes;
  skillBonuses: SkillBonuses;
  skills: Skills;
  statBonuses: StatBonuses;
  stats: Stats;
  tipTexts: TipTexts;
  users: Users;
  weapons: Weapons;
  weaponScopes: WeaponScopes;
  weaponStyles: WeaponStyles;
  weaponTypes: WeaponTypes;

  constructor() {
    this.actionDurations = new ActionDurations();
    this.actions = new Actions();
    this.actionTypes = new ActionTypes();
    this.ammos = new Ammos();
    this.armors = new Armors();
    this.armorTypes = new ArmorTypes();
    this.arcanes = new Arcanes();
    this.auth = new Auth();
    this.bags = new Bags();
    this.bodies = new Bodies();
    this.bodyParts = new BodyParts();
    this.campaigns = new Campaigns();
    this.chapters = new Chapters();
    this.chapterTypes = new ChapterTypes();
    this.characters = new Characters();
    this.charParamBonuses = new CharParamBonuses();
    this.charParams = new CharParams();
    this.cyberFrames = new CyberFrames();
    this.damages = new Damages();
    this.damageTypes = new DamageTypes();
    this.effects = new Effects();
    this.ennemyAttacks = new EnnemyAttacks();
    this.globalValues = new GlobalValues();
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
    this.campaignEvents = new CampaignEvents();
    this.ruleBooks = new RuleBooks();
    this.ruleBookTypes = new RuleBookTypes();
    this.skillBonuses = new SkillBonuses();
    this.skills = new Skills();
    this.statBonuses = new StatBonuses();
    this.stats = new Stats();
    this.tipTexts = new TipTexts();
    this.users = new Users();
    this.weapons = new Weapons();
    this.weaponScopes = new WeaponScopes();
    this.weaponStyles = new WeaponStyles();
    this.weaponTypes = new WeaponTypes();
  }
}
