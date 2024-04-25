import mongoose from 'mongoose';

import {
  ActionDurationModel,
  ActionModel,
  ActionTypeModel,
  AmmoModel,
  BagModel,
  BodyPartModel,
  CampaignModel,
  ChapterModel,
  ChapterTypeModel,
  CharParamBonusModel,
  CharParamModel,
  CharacterModel,
  CyberFrameBranchModel,
  CyberFrameModel,
  DamageModel,
  DamageTypeModel,
  EffectModel,
  EnnemyAttackModel,
  ImplantModel,
  ItemModifierModel,
  ItemTypeModel,
  MailTokenModel,
  NPCModel,
  NodeModel,
  NotionModel,
  PageModel,
  ProgramModel,
  ProgramScopeModel,
  RarityModel,
  RoleModel,
  RollModel,
  RuleBookModel,
  RuleBookTypeModel,
  SkillBonusModel,
  SkillBranchModel,
  SkillModel,
  StatBonusModel,
  StatModel,
  UserModel,
  WeaponModel,
  WeaponScopeModel,
  WeaponStyleModel,
  WeaponTypeModel,
  type IAction,
  type IActionDuration,
  type IActionType,
  type IAmmo,
  type IBag,
  type IBodyPart,
  type ICampaign,
  type IChapter,
  type IChapterType,
  type ICharParam,
  type ICharParamBonus,
  type ICharacter,
  type ICyberFrame,
  type ICyberFrameBranch,
  type IDamage,
  type IDamageType,
  type IEffect,
  type IEnnemyAttack,
  type IImplant,
  type IItemModifier,
  type IItemType,
  type IMailToken,
  type INPC,
  type INode,
  type INotion,
  type IPage,
  type IProgram,
  type IProgramScope,
  type IRarity,
  type IRole,
  type IRoll,
  type IRuleBook,
  type IRuleBookType,
  type ISkill,
  type ISkillBonus,
  type ISkillBranch,
  type IStat,
  type IStatBonus,
  type IUser,
  type IWeapon,
  type IWeaponScope,
  type IWeaponStyle,
  type IWeaponType,
} from './entities';

mongoose.Promise = global.Promise;

interface DBType {
  /** The User Model */
  User: mongoose.Model<IUser>;
  /** The Role Model */
  Role: mongoose.Model<IRole>;
  /** The Bag Model */
  Bag: mongoose.Model<IBag>;
  /** The Notion Model */
  Notion: mongoose.Model<INotion>;
  /** The RuleBook Model */
  RuleBook: mongoose.Model<IRuleBook>;
  /** The RuleBook Types Model */
  RuleBookType: mongoose.Model<IRuleBookType>;
  /** The Chapter Model */
  Chapter: mongoose.Model<IChapter>;
  /** The Chapter Types Model */
  ChapterType: mongoose.Model<IChapterType>;
  /** The Page Model */
  Page: mongoose.Model<IPage>;
  /** The Campaign Model */
  Campaign: mongoose.Model<ICampaign>;
  /** The Character Model */
  Character: mongoose.Model<ICharacter>;
  /** The Body Part Model */
  BodyPart: mongoose.Model<IBodyPart>;
  /** The Roll Model */
  Roll: mongoose.Model<IRoll>;
  /** The Mail Token Model (for forgotten password) */
  MailToken: mongoose.Model<IMailToken>;
  /** The Action Model */
  Action: mongoose.Model<IAction>;
  /** The Action Type Model */
  ActionType: mongoose.Model<IActionType>;
  /** The Action Duration Model */
  ActionDuration: mongoose.Model<IActionDuration>;
  /** The Effect Model */
  Effect: mongoose.Model<IEffect>;
  /** The Stat Model */
  Stat: mongoose.Model<IStat>;
  /** The Stat bonus Model */
  StatBonus: mongoose.Model<IStatBonus>;
  /** The Skill Model */
  Skill: mongoose.Model<ISkill>;
  /** The Skill branch Model */
  SkillBranch: mongoose.Model<ISkillBranch>;
  /** The Skill bonus Model */
  SkillBonus: mongoose.Model<ISkillBonus>;
  /** The CharParam Model */
  CharParam: mongoose.Model<ICharParam>;
  /** The CharParamBonus Model */
  CharParamBonus: mongoose.Model<ICharParamBonus>;
  /** The CyberFrame Model */
  CyberFrame: mongoose.Model<ICyberFrame>;
  /** The CyberFramebranch Model */
  CyberFrameBranch: mongoose.Model<ICyberFrameBranch>;
  /** The Node Model */
  Node: mongoose.Model<INode>;
  /** The ItemType Model */
  ItemType: mongoose.Model<IItemType>;
  /** The ItemModifier Model */
  ItemModifier: mongoose.Model<IItemModifier>;
  /** The Rarity model */
  Rarity: mongoose.Model<IRarity>;
  /** The WeaponStyle model */
  Ammo: mongoose.Model<IAmmo>;
  /** The WeaponScope model */
  WeaponScope: mongoose.Model<IWeaponScope>;
  /** The WeaponStyle model */
  WeaponStyle: mongoose.Model<IWeaponStyle>;
  /** The WeaponType model */
  WeaponType: mongoose.Model<IWeaponType>;
  /** The Weapon model */
  Weapon: mongoose.Model<IWeapon>;
  /** The Damage model */
  Damage: mongoose.Model<IDamage>;
  /** The Program Scope model */
  ProgramScope: mongoose.Model<IProgramScope>;
  /** The Program model */
  Program: mongoose.Model<IProgram>;
  /** The NPC model */
  NPC: mongoose.Model<INPC>;
  /** The EnnemyAttack model */
  EnnemyAttack: mongoose.Model<IEnnemyAttack>;
  /** The Damage Type model */
  DamageType: mongoose.Model<IDamageType>;
  /** The Damage Type model */
  Implant: mongoose.Model<IImplant>;
  /** The possible Roles */
  ROLES: string[];
}

const db: DBType = {
  // User (Agent) models
  User: UserModel(),
  Role: RoleModel(),
  MailToken: MailTokenModel(),
  ROLES: ['user', 'admin'],
  // Rulebook models
  Chapter: ChapterModel(),
  ChapterType: ChapterTypeModel(),
  Notion: NotionModel(),
  Page: PageModel(),
  RuleBook: RuleBookModel(),
  RuleBookType: RuleBookTypeModel(),
  // Campaign models
  Campaign: CampaignModel(),
  Roll: RollModel(),
  // Character models
  Character: CharacterModel(),
  BodyPart: BodyPartModel(),
  // Rules models
  Action: ActionModel(),
  ActionDuration: ActionDurationModel(),
  ActionType: ActionTypeModel(),
  CharParam: CharParamModel(),
  CharParamBonus: CharParamBonusModel(),
  CyberFrame: CyberFrameModel(),
  CyberFrameBranch: CyberFrameBranchModel(),
  Effect: EffectModel(),
  Node: NodeModel(),
  Skill: SkillModel(),
  SkillBonus: SkillBonusModel(),
  SkillBranch: SkillBranchModel(),
  Stat: StatModel(),
  StatBonus: StatBonusModel(),
  // Items models
  Ammo: AmmoModel(),
  Bag: BagModel(),
  Damage: DamageModel(),
  DamageType: DamageTypeModel(),
  ItemModifier: ItemModifierModel(),
  ItemType: ItemTypeModel(),
  Program: ProgramModel(),
  ProgramScope: ProgramScopeModel(),
  Rarity: RarityModel(),
  Weapon: WeaponModel(),
  WeaponScope: WeaponScopeModel(),
  WeaponStyle: WeaponStyleModel(),
  WeaponType: WeaponTypeModel(),
  Implant: ImplantModel(),
  // NPC models
  EnnemyAttack: EnnemyAttackModel(),
  NPC: NPCModel(),
};

export default db;
