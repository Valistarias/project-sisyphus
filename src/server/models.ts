import mongoose, { type Model } from 'mongoose';

import {
  ActionDurationModel,
  ActionModel,
  ActionTypeModel,
  AmmoModel,
  ArcaneModel,
  ArmorModel,
  ArmorTypeModel,
  BagModel,
  BodyAmmoModel,
  BodyArmorModel,
  BodyBagModel,
  BodyImplantModel,
  BodyModel,
  BodyPartModel,
  BodyProgramModel,
  BodySkillModel,
  BodyWeaponModel,
  CampaignEventModel,
  CampaignModel,
  ChapterModel,
  ChapterTypeModel,
  CharacterModel,
  CharacterNodeModel,
  CharacterStatModel,
  CharParamBonusModel,
  CharParamModel,
  ClergyModel,
  CyberFrameCharParamModel,
  CyberFrameModel,
  CyberFrameStatModel,
  DamageModel,
  DamageTypeModel,
  EffectModel,
  EnnemyAttackModel,
  GlobalValueModel,
  ImplantModel,
  ItemModel,
  ItemModifierModel,
  ItemTypeModel,
  MailTokenModel,
  NodeModel,
  NotionModel,
  NPCModel,
  PageModel,
  ProgramModel,
  ProgramScopeModel,
  RarityModel,
  RoleModel,
  RuleBookModel,
  RuleBookTypeModel,
  SkillBonusModel,
  SkillModel,
  StatBonusModel,
  StatModel,
  TipTextModel,
  type IAction,
  type IActionDuration,
  type IActionType,
  type IAmmo,
  type IArcane,
  type IArmor,
  type IArmorType,
  type IBag,
  type IBody,
  type IBodyAmmo,
  type IBodyArmor,
  type IBodyBag,
  type IBodyImplant,
  type IBodyPart,
  type IBodyProgram,
  type IBodySkill,
  type IBodyWeapon,
  type ICampaign,
  type ICampaignEvent,
  type IChapter,
  type IChapterType,
  type ICharacter,
  type ICharacterNode,
  type ICharacterStat,
  type ICharParam,
  type ICharParamBonus,
  type IClergy,
  type ICyberFrame,
  type ICyberFrameCharParam,
  type ICyberFrameStat,
  type IDamage,
  type IDamageType,
  type IEffect,
  type IEnnemyAttack,
  type IGlobalValue,
  type IImplant,
  type IItem,
  type IItemModifier,
  type IItemType,
  type IMailToken,
  type INode,
  type INotion,
  type INPC,
  type IPage,
  type IProgram,
  type IProgramScope,
  type IRarity,
  type IRole,
  type IRuleBook,
  type IRuleBookType,
  type ISkill,
  type ISkillBonus,
  type IStat,
  type IStatBonus,
  type ITipText,
  type IUser,
  type IVow,
  type IWeapon,
  type IWeaponScope,
  type IWeaponStyle,
  type IWeaponType,
  UserModel,
  VowModel,
  WeaponModel,
  WeaponScopeModel,
  WeaponStyleModel,
  WeaponTypeModel,
} from './entities';
import { BodyItemModel, type IBodyItem } from './entities/body';

mongoose.Promise = global.Promise;

/* 
  eslint-disable-next-line @typescript-eslint/no-explicit-any -- No
  choices of any, since the type of ObjectId
  is not clean on Mongoose it seems
*/
type CleanObjectId = any;

interface DBType {
  /** The User Model */
  User: Model<IUser>;
  /** The Role Model */
  Role: Model<IRole>;
  /** The Bag Model */
  Bag: Model<IBag<CleanObjectId>>;
  /** The Notion Model */
  Notion: Model<INotion>;
  /** The RuleBook Model */
  RuleBook: Model<IRuleBook>;
  /** The RuleBook Types Model */
  RuleBookType: Model<IRuleBookType>;
  /** The Chapter Model */
  Chapter: Model<IChapter>;
  /** The Chapter Types Model */
  ChapterType: Model<IChapterType>;
  /** The Page Model */
  Page: Model<IPage>;
  /** The Campaign Model */
  Campaign: Model<ICampaign<CleanObjectId>>;
  /** The Character Model */
  Character: Model<ICharacter<CleanObjectId>>;
  /** The CharacterNode Model */
  CharacterNode: Model<ICharacterNode>;
  /** The CharacterStat Model */
  CharacterStat: Model<ICharacterStat>;
  /** The Body Model */
  Body: Model<IBody<CleanObjectId>>;
  /** The BodyStat Model */
  BodySkill: Model<IBodySkill>;
  /** The BodyAmmo Model */
  BodyAmmo: Model<IBodyAmmo<CleanObjectId>>;
  /** The BodyItem Model */
  BodyItem: Model<IBodyItem>;
  /** The BodyArmor Model */
  BodyArmor: Model<IBodyArmor>;
  /** The BodyBag Model */
  BodyBag: Model<IBodyBag<CleanObjectId>>;
  /** The BodyImplant Model */
  BodyImplant: Model<IBodyImplant>;
  /** The BodyProgram Model */
  BodyProgram: Model<IBodyProgram>;
  /** The BodyWeapon Model */
  BodyWeapon: Model<IBodyWeapon>;
  /** The Body Part Model */
  BodyPart: Model<IBodyPart>;
  /** The CampaignEvent Model */
  CampaignEvent: Model<ICampaignEvent>;
  /** The Mail Token Model (for forgotten password) */
  MailToken: Model<IMailToken>;
  /** The Action Model */
  Action: Model<IAction<CleanObjectId>>;
  /** The Action Type Model */
  ActionType: Model<IActionType>;
  /** The Action Duration Model */
  ActionDuration: Model<IActionDuration>;
  /** The Effect Model */
  Effect: Model<IEffect>;
  /** The GlobalValue Model */
  GlobalValue: Model<IGlobalValue>;
  /** The Stat Model */
  Stat: Model<IStat>;
  /** The Clergy Model */
  Clergy: Model<IClergy>;
  /** The Vow Model */
  Vow: Model<IVow>;
  /** The Tip Text Model */
  TipText: Model<ITipText>;
  /** The Stat bonus Model */
  StatBonus: Model<IStatBonus>;
  /** The Skill Model */
  Skill: Model<ISkill>;
  /** The Skill bonus Model */
  SkillBonus: Model<ISkillBonus>;
  /** The CharParam Model */
  CharParam: Model<ICharParam>;
  /** The CharParamBonus Model */
  CharParamBonus: Model<ICharParamBonus>;
  /** The CyberFrame Model */
  CyberFrame: Model<ICyberFrame>;
  /** The CyberFrameStat Model */
  CyberFrameStat: Model<ICyberFrameStat>;
  /** The CyberFrameStat Model */
  CyberFrameCharParam: Model<ICyberFrameCharParam>;
  /** The Node Model */
  Node: Model<INode<CleanObjectId>>;
  /** The ItemType Model */
  ItemType: Model<IItemType>;
  /** The ItemModifier Model */
  ItemModifier: Model<IItemModifier>;
  /** The Rarity model */
  Rarity: Model<IRarity>;
  /** The WeaponStyle model */
  Ammo: Model<IAmmo<CleanObjectId>>;
  /** The WeaponScope model */
  WeaponScope: Model<IWeaponScope>;
  /** The WeaponStyle model */
  WeaponStyle: Model<IWeaponStyle>;
  /** The WeaponType model */
  WeaponType: Model<IWeaponType>;
  /** The Weapon model */
  Weapon: Model<IWeapon<CleanObjectId>>;
  /** The Damage model */
  Damage: Model<IDamage>;
  /** The Program Scope model */
  ProgramScope: Model<IProgramScope>;
  /** The Program model */
  Program: Model<IProgram<CleanObjectId>>;
  /** The NPC model */
  NPC: Model<INPC>;
  /** The EnnemyAttack model */
  EnnemyAttack: Model<IEnnemyAttack>;
  /** The Damage Type model */
  DamageType: Model<IDamageType>;
  /** The Damage Type model */
  Implant: Model<IImplant<CleanObjectId>>;
  /** The Armor Type model */
  ArmorType: Model<IArmorType>;
  /** The Armor model */
  Armor: Model<IArmor<CleanObjectId>>;
  /** The Item model */
  Item: Model<IItem<CleanObjectId>>;
  /** The Arcane Model */
  Arcane: Model<IArcane>;
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
  CampaignEvent: CampaignEventModel(),
  Arcane: ArcaneModel(),
  // Character models
  Character: CharacterModel(),
  CharacterNode: CharacterNodeModel(),
  CharacterStat: CharacterStatModel(),
  Body: BodyModel(),
  BodySkill: BodySkillModel(),
  BodyAmmo: BodyAmmoModel(),
  BodyArmor: BodyArmorModel(),
  BodyBag: BodyBagModel(),
  BodyImplant: BodyImplantModel(),
  BodyItem: BodyItemModel(),
  BodyProgram: BodyProgramModel(),
  BodyWeapon: BodyWeaponModel(),
  BodyPart: BodyPartModel(),
  // Rules models
  Action: ActionModel(),
  ActionDuration: ActionDurationModel(),
  ActionType: ActionTypeModel(),
  CharParam: CharParamModel(),
  CharParamBonus: CharParamBonusModel(),
  CyberFrame: CyberFrameModel(),
  CyberFrameStat: CyberFrameStatModel(),
  CyberFrameCharParam: CyberFrameCharParamModel(),
  Effect: EffectModel(),
  Node: NodeModel(),
  Skill: SkillModel(),
  SkillBonus: SkillBonusModel(),
  Stat: StatModel(),
  Clergy: ClergyModel(),
  Vow: VowModel(),
  StatBonus: StatBonusModel(),
  TipText: TipTextModel(),
  GlobalValue: GlobalValueModel(),
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
  ArmorType: ArmorTypeModel(),
  Armor: ArmorModel(),
  Item: ItemModel(),
  // NPC models
  EnnemyAttack: EnnemyAttackModel(),
  NPC: NPCModel(),
};

export default db;
