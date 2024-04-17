import mongoose from 'mongoose';

import {
  ActionDurationModel,
  ActionModel,
  ActionTypeModel,
  CampaignModel,
  ChapterModel,
  ChapterTypeModel,
  CharParamBonusModel,
  CharParamModel,
  CharacterModel,
  CyberFrameBranchModel,
  CyberFrameModel,
  EffectModel,
  ItemModifierModel,
  MailTokenModel,
  NodeModel,
  NotionModel,
  PageModel,
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
  WeaponScopeModel,
  WeaponStyleModel,
  WeaponTypeModel,
  type IAction,
  type IActionDuration,
  type IActionType,
  type ICampaign,
  type IChapter,
  type IChapterType,
  type ICharParam,
  type ICharParamBonus,
  type ICharacter,
  type ICyberFrame,
  type ICyberFrameBranch,
  type IEffect,
  type IItemModifier,
  type IMailToken,
  type INode,
  type INotion,
  type IPage,
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
  /** The ItemModifier Model */
  ItemModifier: mongoose.Model<IItemModifier>;
  /** The RarityModel Model */
  Rarity: mongoose.Model<IRarity>;
  /** The WeaponScopeModel Model */
  WeaponScope: mongoose.Model<IWeaponScope>;
  /** The WeaponStyleModel Model */
  WeaponStyle: mongoose.Model<IWeaponStyle>;
  /** The WeaponTypeModel Model */
  WeaponType: mongoose.Model<IWeaponType>;
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
  Notion: NotionModel(),
  RuleBook: RuleBookModel(),
  RuleBookType: RuleBookTypeModel(),
  Chapter: ChapterModel(),
  ChapterType: ChapterTypeModel(),
  Page: PageModel(),
  // Campaign models
  Campaign: CampaignModel(),
  Roll: RollModel(),
  // Character models
  Character: CharacterModel(),
  // Rules models
  Action: ActionModel(),
  ActionDuration: ActionDurationModel(),
  ActionType: ActionTypeModel(),
  Effect: EffectModel(),
  Stat: StatModel(),
  StatBonus: StatBonusModel(),
  Skill: SkillModel(),
  SkillBonus: SkillBonusModel(),
  SkillBranch: SkillBranchModel(),
  CharParam: CharParamModel(),
  CharParamBonus: CharParamBonusModel(),
  CyberFrame: CyberFrameModel(),
  CyberFrameBranch: CyberFrameBranchModel(),
  Node: NodeModel(),
  // Items models
  ItemModifier: ItemModifierModel(),
  Rarity: RarityModel(),
  WeaponScope: WeaponScopeModel(),
  WeaponStyle: WeaponStyleModel(),
  WeaponType: WeaponTypeModel(),
};

export default db;
