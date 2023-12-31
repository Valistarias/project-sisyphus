export interface IUser {
  /** The ID of the user */
  _id: string;
  /** The username of the user */
  username: string;
  /** The mail of the user */
  mail: string;
  /** The user password (encrypted) */
  password: string;
  /** The name of the user */
  name: string;
  /** The chosen language for the UI */
  lang: string;
  /** The chosen theme for the UI */
  theme: string;
  /** The scale of the UI */
  scale: number;
  /** Is the user verified */
  verified: boolean;
  /** The user roles */
  roles: Array<{
    _id: string;
    name: string;
  }>;
}

// Rulebook ------------------------------------

export interface IRuleBookType {
  /** The ID of the rulebook type */
  _id: string;
  /** The name of the rulebook type */
  name: string;
}

export interface IRuleBook {
  /** The ID of the rulebook */
  _id: string;
  /** The title of the rulebook */
  title: string;
  /** The type of the rulebook */
  type: {
    _id: string;
    name: string;
  };
  /** The summary of the rulebook */
  summary: string;
  /** Is the RuleBook a draft ? */
  draft: boolean;
  /** Is the RuleBook archived ? */
  archived: boolean;
  /** When the rulebook was created */
  createdAt: string;
  /** All the related Notions */
  notions: INotion[];
  /** All the related Chapters */
  chapters: IChapter[];
}

export interface ICuratedRuleBook {
  i18n: Record<string, any> | Record<string, unknown>;
  ruleBook: IRuleBook;
}

// Chapter ------------------------------------

export interface IChapterType {
  /** The ID of the chapter type */
  _id: string;
  /** The name of the chapter type */
  name: string;
}

export interface IChapter {
  /** The ID of the chapter */
  _id: string;
  /** The title of the chapter */
  title: string;
  /** The rulebook linked to this chapter */
  ruleBook: IRuleBook;
  /** The type of the chapter */
  type: {
    _id: string;
    name: string;
  };
  /** The summary of the chapter */
  summary: string;
  /** The position of this chapter, in reference with others */
  position: number;
  /** When the chapter was created */
  createdAt: string;
  /** All the related Pages */
  pages: IPage[];
}

export interface ICuratedChapter {
  i18n: Record<string, any> | Record<string, unknown>;
  chapter: IChapter;
}

// Page ------------------------------------

export interface IPage {
  /** The ID of the page */
  _id: string;
  /** The title of the page */
  title: string;
  /** The title of the page */
  content: string;
  /** The rulebook linked to this page */
  chapter: IChapter;
  /** The position of this page, in reference with others */
  position: number;
  /** When the page was created */
  createdAt: string;
}

export interface ICuratedPage {
  i18n: Record<string, any> | Record<string, unknown>;
  page: IPage;
}

// Notion ------------------------------------

export interface INotion {
  /** The ID of the notion */
  _id: string;
  /** The title of the notion */
  title: string;
  /** The content of the notion */
  text: string;
  /** The rulebook associated with this notion */
  ruleBook: string;
  /** When the notion was created */
  createdAt: string;
}

export interface ICuratedNotion {
  i18n: Record<string, any> | Record<string, unknown>;
  notion: INotion;
}

// Campaign ------------------------------------

export interface ICampaign {
  /** The ID of the campaign */
  _id: string;
  /** The name of the campaign */
  name: string;
  /** The code of the campaign to connect to it */
  code: string;
  /** The owner of the campaign */
  owner: IUser;
  /** The players of the campaign */
  players: IUser[];
  /** When the campaign was created */
  createdAt: string;
}

// Character ------------------------------------

export interface ICharacter {
  /** The ID of the character */
  _id: string;
  /** The name of the character */
  name: string;
  /** The owner of the character */
  player: IUser;
  /** The players of the character */
  campaign: ICampaign;
  /** When the character was created */
  createdAt: string;
}
